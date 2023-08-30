import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { PageTitleService } from '../core/page-title/page-title.service';
import { VisitService } from '../services/visit.service';
import * as moment from 'moment';
// import { SocketService } from '../services/socket.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  showAll: boolean = false;
  displayedColumns1: string[] = ['name', 'age', 'in_labor_duration', 'no_of_alerts', 'stage', 'cervix_plot', 'descent_plot', 'alarming_readings', 'provider'];
  displayedColumns2: string[] = ['name', 'age', 'in_labor_duration', 'no_of_alerts', 'stage', 'cervix_plot', 'descent_plot', 'alarming_readings', 'provider'];
  displayedColumns3: string[] = ['name', 'age', 'date_of_birth', 'no_of_alerts', 'stage', 'cervix_plot', 'descent_plot', 'alarming_readings', 'birth_outcome', 'reason', 'provider'];

  dataSource1 = new MatTableDataSource<any>();
  dataSource2 = new MatTableDataSource<any>();
  dataSource3 = new MatTableDataSource<any>();

  baseUrl: string = environment.baseURL;
  normalCases: any = [];
  priorityCases: any = [];
  completedCases: any = [];

  specialization: string = '';
  hourlyStages = [
    'Stage1_Hour1_1',
    'Stage1_Hour1_2',
    'Stage1_Hour2_1',
    'Stage1_Hour2_2',
    'Stage1_Hour3_1',
    'Stage1_Hour3_2',
    'Stage1_Hour4_1',
    'Stage1_Hour4_2',
    'Stage1_Hour5_1',
    'Stage1_Hour5_2',
    'Stage1_Hour6_1',
    'Stage1_Hour6_2',
    'Stage1_Hour7_1',
    'Stage1_Hour7_2',
    'Stage1_Hour8_1',
    'Stage1_Hour8_2',
    'Stage1_Hour9_1',
    'Stage1_Hour9_2',
    'Stage1_Hour10_1',
    'Stage1_Hour10_2',
    'Stage1_Hour11_1',
    'Stage1_Hour11_2',
    'Stage1_Hour12_1',
    'Stage1_Hour12_2',
    'Stage2_Hour1_1',
    'Stage2_Hour1_2',
    'Stage2_Hour1_3',
    'Stage2_Hour1_4',
    'Stage2_Hour2_1',
    'Stage2_Hour2_2',
    'Stage2_Hour2_3',
    'Stage2_Hour2_4',
    'Stage2_Hour3_1',
    'Stage2_Hour3_2',
    'Stage2_Hour3_3',
    'Stage2_Hour3_4',
  ];

  allowedNotesToShow = [
    'Baseline FHR',
    'FHR Deceleration',
    'Amniotic fluid',
    'Moulding',
    'Systolic BP',
    'Diastolic BP'
  ];

  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild('normalPaginator') normalPaginator: MatPaginator;
  @ViewChild('priorityPaginator') priorityPaginator: MatPaginator;
  @ViewChild('completedPaginator') completedPaginator: MatPaginator;

  subscription: Subscription;

  constructor(
    private pageTitleService: PageTitleService,
    private visitService: VisitService,
    private router: Router,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: "Dashboard", imgUrl: "assets/svgs/menu-info-circle.svg" });
    let provider = JSON.parse(localStorage.getItem('provider'));
    if (provider) {
      if (provider.attributes.length) {
        this.specialization = this.getSpecialization(provider.attributes);
      } else {
        this.router.navigate(['/dashboard/get-started']);
      }
      this.getVisits();

      this.subscription = this.authService.$tour.subscribe(val => {
        if (val) {
          this.showAll = true;
          this.accordion.openAll();
        }
      });
    }
  }

  getVisits() {
    this.normalCases = [];
    this.priorityCases = [];
    this.completedCases = [];
    this.visitService.getVisits({ includeInactive: true }).subscribe(
      (response: any) => {
        let visits = response.results;
        visits.forEach((visit: any) => {
          visit.seen = false;
          // Check if visit has encounters
          if (visit.encounters.length > 0) {
            /*
            Check if visit has visit attributes, if yes match visit speciality attribute with current doctor specialization
            If no attributes, consider it as General Physician
            */
            if (visit.attributes.length) {
              let flag = 0;
              for (let t = 0; t < visit.attributes.length; t++) {
                if (visit.attributes[t].attributeType.uuid == "3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d") {
                  // If specialization matches process visit
                  if (visit.attributes[t].value == this.specialization) {
                    flag = 1;
                    // this.processVisit(visit);
                    //  break;
                  }
                }
                if (visit.attributes[t].attributeType.uuid == "2e4b62a5-aa71-43e2-abc9-f4a777697b19") {
                  if (visit.attributes[t].value.includes(this.user?.uuid.split('-')[0])) {
                    visit.seen = true;
                  }
                }
              }
              if (flag == 1) {
                this.processVisit(visit);
              }
            } else if (this.specialization == 'General Physician') {
              this.processVisit(visit);
            }
          }
        });
      });
  }

  checkIfEncounterExists(encounters: any, visitType: string) {
    return encounters.find(({ display = "" }) => display.includes(visitType));
  }

  get user() {
    return JSON.parse(localStorage.getItem('user'));
  }

  processVisit(visit: any) {
    let notes = [];
    let notesObj = {};
    const { encounters } = visit;
    encounters.sort((a: any, b: any) => {
      return (
        new Date(a.encounterDatetime).getTime() -
        new Date(b.encounterDatetime).getTime()
      );
    });

    visit.score = this.setScore(encounters);
    visit.in_labour_duration = this.getCreatedAt(visit.startDatetime);
    visit.stage = encounters.filter((e: any) => e.display.includes('Stage2')).length ? 2 : 1;
    visit.notesObj = {};
    if (Array.isArray(encounters)) {
      for (let x = 0; x < encounters.length; x++) {
        if (Array.isArray(encounters[x].obs)) {
          for (let y = 0; y < encounters[x].obs.length; y++) {
            const key = encounters[x].obs[y].display.split(':')[0]?.trim();
            const value = encounters[x].obs[y].display.split(':')[1]?.trim();
            if (encounters[x].obs[y]?.comment === "R") {
              if (this.allowedNotesToShow.includes(key)) {
                notesObj[key] = value;
              }
            }
            if (key == 'Cervix 0 cm, 1 cm, 2 cm, 3 cm, 4 cm, 5 cm') {
              visit.cervixPlotX = value;
            }
            if (key == 'Descent 0-5') {
              visit.descentPlotO = value;
            }
          }

          if (encounters[x].display.includes('Visit Complete')) {
            let outOfTimeIndex = encounters[x].obs.findIndex((o: any) => o.concept.display == 'OUT OF TIME');
            let referTypeIndex = encounters[x].obs.findIndex((o: any) => o.concept.display == 'Refer Type');
            if (outOfTimeIndex != -1) {
              visit.completeReason = "Out Of Time";
              visit.outOfTimeReason = encounters[x].obs[outOfTimeIndex].value;
            } else if (referTypeIndex != -1) {
              visit.completeReason = encounters[x].obs[referTypeIndex].value;
              if (encounters[x].obs[referTypeIndex].value == 'Other') {
                visit.referTypeOtherReason = encounters[x].obs.find((o: any) => o.concept.display == 'Refer Type Other')?.value;
              }
            } else {
              visit.completeReason = "Labor Complete";
              visit.birthOutcome = encounters[x].obs.find((o: any) => o.concept.display == 'Birth Outcome')?.value;
              if (visit.birthOutcome == 'Other' || visit.birthOutcome == 'OTHER') {
                visit.birthOutcomeOther = encounters[x].obs.find((o: any) => o.concept.display == 'Birth Outcome Other')?.value;
              }
              visit.motherDeceased = encounters[x].obs.find((o: any) => o.concept.display == 'MOTHER DECEASED NEW')?.value;
              if (visit.motherDeceased == 'YES') {
                visit.motherDeceasedReason = encounters[x].obs.find((o: any) => o.concept.display == 'MOTHER DECEASED REASON')?.value;
              }
              visit.dateTimeOfBirth = encounters[x].encounterDatetime;
            }
            // for (let y = 0; y < encounters[x].obs.length; y++) {
            //   if (encounters[x].obs[y].display.includes('Birth Outcome')) {
            //     visit.birthOutcome = encounters[x].obs[y].value;
            //   }
            //   if (encounters[x].obs[y].display.includes('Refer to other Hospital')) {
            //     visit.birthOutcome = 'RTOH';
            //   }
            //   if (encounters[x].obs[y].display.includes('Self discharge against Medical Advice')) {
            //     visit.birthOutcome = 'DAMA';
            //   }
            //   visit.dateTimeOfBirth = encounters[x].encounterDatetime;
            // }
          }
        }
      }
      if (Array.isArray(notes)) {
        for (const k in notesObj) {
          if (Object.prototype.hasOwnProperty.call(notesObj, k)) {
            notes.push({
              key: k,
              value: notesObj[k]
            })
          }
        }
        notes = notes.sort((a, b) => a?.key.localeCompare(b?.key));
      }
    }
    visit.notes = notes;
    visit.provider = encounters[0]?.encounterProviders[0]?.provider.name || 'NA';

    if (this.checkIfEncounterExists(encounters, 'Visit Complete') || this.checkIfEncounterExists(encounters, 'Patient Exit Survey') || visit.stopDatetime != null) {
      this.completedCases.push(visit);
    } else if (visit.score > 22) {
      this.priorityCases.push(visit);
    } else {
      this.normalCases.push(visit);
    }

    this.dataSource1 = new MatTableDataSource(this.normalCases);
    this.dataSource1.paginator = this.normalPaginator;
    this.dataSource1.filterPredicate = (data: any, filter: string) => data?.patient.identifiers[0]?.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient.person.display.toLowerCase().indexOf(filter) != -1;
    this.dataSource2 = new MatTableDataSource(this.priorityCases);
    this.dataSource2.paginator = this.priorityPaginator;
    this.dataSource2.filterPredicate = (data: any, filter: string) => data?.patient.identifiers[0]?.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient.person.display.toLowerCase().indexOf(filter) != -1;
    this.dataSource3 = new MatTableDataSource(this.completedCases);
    this.dataSource3.paginator = this.completedPaginator;
    this.dataSource3.filterPredicate = (data: any, filter: string) => data?.patient.identifiers[0]?.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient.person.display.toLowerCase().indexOf(filter) != -1;
  }

  setScore(encounters: any) {
    let score: any = 0;
    let stageData = {};
    let statusData = {};
    for (let t = 0; t < encounters.length; t++) {
      if (Array.isArray(encounters[t].obs) && encounters[t].obs.length) {
        const stage = encounters[t].display;
        if (!stageData[stage]) stageData[stage] = 0;

        let score1 = stageData[stage];
        const yellow = encounters[t].obs.filter(
          (obs: any) => obs.comment === "Y"
        ).length;
        const red = encounters[t].obs.filter(
          (obs: any) => obs.comment === "R"
        ).length;
        score1 += red * 2;
        score1 += yellow * 1;
        stageData[stage] = score1;
      }
    }

    for (const key in stageData) {
      if (Object.prototype.hasOwnProperty.call(stageData, key)) {
        const value = stageData[key];
        this.hourlyStages.forEach(stage => {
          if (!statusData[stage]) statusData[stage] = 0;
          if (key.includes(stage)) {
            statusData[stage] += value;
          }
        });
      }
    }

    score = Object.values(stageData).pop();
    // score = Object.values(statusData).filter(a => a).pop();
    if (!score) score = 0;
    return score;
  }

  getCreatedAt(data: any) {
    let hours = moment().diff(moment(data), 'hours');
    let minutes = moment().diff(moment(data), 'minutes');
    if (hours > 24) {
      return moment(data).format('DD MMM, YYYY hh:mm a');
    };
    if (hours < 1) {
      return `${minutes} minutes`;
    }
    return `${hours} hrs`;
  }

  getSpecialization(attr: any) {
    let specialization = '';
    attr.forEach((a: any) => {
      if (a.attributeType.uuid == 'ed1715f5-93e2-404e-b3c9-2a2d9600f062' && !a.voided) {
        specialization = a.value;
      }
    });
    return specialization;
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  playNotify() {
    const audioUrl = "../../../../intelehealth/assets/notification.mp3";
    new Audio(audioUrl).play();
  }

  applyFilter1(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
  }

  applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource1.filter = filterValue.trim().toLowerCase();
  }

  applyFilter3(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource3.filter = filterValue.trim().toLowerCase();
  }

  ngOnDestroy() {
    // if (this.socket.socket && this.socket.socket.close)
    //   this.socket.socket.close();
    this.subscription?.unsubscribe();
  }

}
