import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { PageTitleService } from '../core/page-title/page-title.service';
import { VisitService } from '../services/visit.service';
import * as moment from 'moment';
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
  priorityVisitsCount: number = 0;
  inprogressVisitsCount: number = 0;
  completedVisitsCount: number = 0;

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

  obsConcepts = [
    'Companion',
    'Pain relief',
    'Oral Fluid',
    'Posture',
    'Baseline FHR',
    'FHR Deceleration',
    'Amniotic fluid',
    'Fetal position',
    'Caput',
    'Moulding',
    'PULSE',
    'Systolic BP',
    'Diastolic BP',
    'TEMPERATURE (C)',
    'Urine protein',
    'Contractions per 10 min',
    'Duration of contraction',
    'Cervix 0 cm, 1 cm, 2 cm, 3 cm, 4 cm, 5 cm',
    'Descent 0-5',
    'Oxytocin U/l, Drops per min',
    'Medicine',
    'IV fluids',
    'Assessment',
    'Additional Comments',
    'Encounter status',
    'Urine acetone'
  ]

  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild('normalPaginator') normalPaginator: MatPaginator;
  @ViewChild('priorityPaginator') priorityPaginator: MatPaginator;
  @ViewChild('completedPaginator') completedPaginator: MatPaginator;

  offset: number = environment.recordsPerPage;
  priorityRecordsFetched: number = 0;
  pageEvent1: PageEvent;
  pageIndex1:number = 0;
  pageSize1:number = 5;

  inprogressRecordsFetched: number = 0;
  pageEvent2: PageEvent;
  pageIndex2:number = 0;
  pageSize2:number = 5;

  completedRecordsFetched: number = 0;
  pageEvent3: PageEvent;
  pageIndex3:number = 0;
  pageSize3:number = 5;

  @ViewChild('tempPaginator1') tempPaginator1: MatPaginator;
  @ViewChild('tempPaginator2') tempPaginator2: MatPaginator;
  @ViewChild('tempPaginator3') tempPaginator3: MatPaginator;
  subscription: Subscription;

  @ViewChild('prSearchInput', { static: true }) prSearchElement: ElementRef;
  @ViewChild('ipSearchInput', { static: true }) ipSearchElement: ElementRef;
  @ViewChild('coSearchInput', { static: true }) coSearchElement: ElementRef;

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
      this.getPriorityVisits(1);
      this.getInProgressVisits(1);
      this.getCompletedVisits(1);

      this.subscription = this.authService.$tour.subscribe(val => {
        if (val) {
          this.showAll = true;
          this.accordion.openAll();
        }
      });
    }
  }

  getPriorityVisits(page: number = 1) {
    if(page == 1) this.priorityCases = [];
    this.visitService.getPriorityVisits(page).subscribe((pv: any) => {
      if (pv.success) {
        this.priorityVisitsCount = pv.totalCount;
        this.priorityRecordsFetched += this.offset;
        for (let visit of pv.data) {
          visit.person.age = this.calculateAge(visit.person.birthdate);
          this.priorityCases.push({ ...visit, ...this.extractVisitDetail(visit) });
        }
        this.dataSource2.data = [...this.priorityCases];
        if (page == 1) {
          this.dataSource2.paginator = this.tempPaginator1;
          this.dataSource2.filterPredicate = (data: any, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat(' ' + data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
        } else {
          this.tempPaginator1.length = this.priorityCases.length;
          this.tempPaginator1.nextPage();
        }
      }
    });
  }

  public getPriorityData(event?:PageEvent){
    this.pageIndex1 = event.pageIndex;
    this.pageSize1 = event.pageSize;
    if (this.dataSource2.filter) {
      this.priorityPaginator.firstPage();
    }
    if (((event.pageIndex+1)*this.pageSize1) > this.priorityRecordsFetched) {
      this.getPriorityVisits((this.priorityRecordsFetched+this.offset)/this.offset);
    } else if (event.previousPageIndex < event.pageIndex) {
      this.tempPaginator1.nextPage();
    } else {
      this.tempPaginator1.previousPage();
    }
    return event;
  }

  getInProgressVisits(page: number = 1) {
    if(page == 1) this.normalCases = [];
    this.visitService.getInProgressVisits(page).subscribe((iv: any) => {
      if (iv.success) {
        this.inprogressVisitsCount = iv.totalCount;
        this.inprogressRecordsFetched += this.offset;
        for (let visit of iv.data) {
          visit.person.age = this.calculateAge(visit.person.birthdate);
          this.normalCases.push({ ...visit, ...this.extractVisitDetail(visit) });
        }
        this.dataSource1.data = [...this.normalCases];
        if (page == 1) {
          this.dataSource1.paginator = this.tempPaginator2;
          this.dataSource1.filterPredicate = (data: any, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat(' ' + data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
        } else {
          this.tempPaginator2.length = this.normalCases.length;
          this.tempPaginator2.nextPage();
        }
      }
    });
  }

  public getInprogressData(event?:PageEvent){
    this.pageIndex2 = event.pageIndex;
    this.pageSize2 = event.pageSize;
    if (this.dataSource1.filter) {
      this.normalPaginator.firstPage();
    }
    if (((event.pageIndex+1)*this.pageSize2) > this.inprogressRecordsFetched) {
      this.getInProgressVisits((this.inprogressRecordsFetched+this.offset)/this.offset);
    } else if (event.previousPageIndex < event.pageIndex) {
      this.tempPaginator2.nextPage();
    } else {
      this.tempPaginator2.previousPage();
    }
    return event;
  }

  getCompletedVisits(page: number = 1) {
    if(page == 1) this.completedCases = [];
    this.visitService.getCompletedVisits(page).subscribe((com: any) => {
      if (com.success) {
        this.completedVisitsCount = com.totalCount;
        this.completedRecordsFetched += this.offset;
        for (let visit of com.data) {
          visit.person.age = this.calculateAge(visit.person.birthdate);
          this.completedCases.push({ ...visit, ...this.extractVisitDetail(visit) });
        }
        this.dataSource3.data = [...this.completedCases];
        if (page == 1) {
          this.dataSource3.paginator = this.tempPaginator3;
          this.dataSource3.filterPredicate = (data: any, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat(' ' + data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
        } else {
          this.tempPaginator3.length = this.completedCases.length;
          this.tempPaginator3.nextPage();
        }
      }
    });
  }

  public getCompletedVisitsData(event?:PageEvent){
    this.pageIndex3 = event.pageIndex;
    this.pageSize3 = event.pageSize;
    if (this.dataSource3.filter) {
      this.completedPaginator.firstPage();
    }
    if (((event.pageIndex+1)*this.pageSize3) > this.completedRecordsFetched) {
      this.getCompletedVisits((this.completedRecordsFetched+this.offset)/this.offset);
    } else if (event.previousPageIndex < event.pageIndex) {
      this.tempPaginator3.nextPage();
    } else {
      this.tempPaginator3.previousPage();
    }
    return event;
  }

  calculateAge(birthdate: any) {
    return moment().diff(birthdate, 'years');
  }

  extractVisitDetail(visit: any) {
    let in_labour_duration = this.getCreatedAt(visit.date_started.replace('Z','+0530'));
    let stage = visit.encounters.filter((e: any) => e.type.name.includes('Stage2')).length ? 2 : 1;
    let notes = [];
    let notesObj = {};
    let cervixPlotX = null;
    let descentPlotO = null;
    let completeReason = null;
    let outOfTimeReason = null;
    let referTypeOtherReason = null;
    let birthOutcome = null;
    let birthOutcomeOther =  null;
    let motherDeceased = null;
    let motherDeceasedReason = null;
    let dateTimeOfBirth = null;
    let provider = null;
    let seen = false;

    if (visit?.attributes) {
      const visitReadAttr = visit.attributes.find(a => a.attribute_type?.name == "Visit Read" && !a.voided);
      if (visitReadAttr) {
        if (visitReadAttr.value_reference.includes(this.user?.uuid.split('-')[0])) {
          seen = true;
        }
      }
    }

    if (Array.isArray(visit.encounters)) {
      for (let x = 0; x < visit.encounters.length; x++) {
        if (Array.isArray(visit.encounters[x].obs) && !visit.encounters[x].voided) {
          for (let y = 0; y < visit.encounters[x].obs.length; y++) {
            if (!visit.encounters[x].obs[y].voided) {
              const obs_concept_name = visit.encounters[x].obs[y].concept.concept_name.find(c => this.obsConcepts.indexOf(c.name) != -1 && !c.voided);
              const key = obs_concept_name ? obs_concept_name.name.trim() : visit.encounters[x].obs[y].concept.concept_name[0].name.trim();
              const value = visit.encounters[x].obs[y].value_text||visit.encounters[x].obs[y].value_numeric;
              if (visit.encounters[x].obs[y]?.comments === "R") {
                if (this.allowedNotesToShow.includes(key)) {
                  notesObj[key] = value;
                }
              }
              if (key == 'Cervix 0 cm, 1 cm, 2 cm, 3 cm, 4 cm, 5 cm') {
                cervixPlotX = value;
              }
              if (key == 'Descent 0-5') {
                descentPlotO = value;
              }
            }
          }

          if (visit.encounters[x].type.name === 'Visit Complete') {
            let outOfTimeIndex = visit.encounters[x].obs.findIndex((o: any) => o.concept.concept_name[0].name == 'OUT_OF_TIME'); //165186
            let referTypeIndex = visit.encounters[x].obs.findIndex((o: any) => o.concept.concept_name[0].name == 'Refer Type'); //165175
            if (outOfTimeIndex != -1) {
              completeReason = "Out Of Time";
              outOfTimeReason = visit.encounters[x].obs[outOfTimeIndex].value_text;
            } else if (referTypeIndex != -1) {
              completeReason = visit.encounters[x].obs[referTypeIndex].value_text;
              if (completeReason == 'Other') {
                referTypeOtherReason = visit.encounters[x].obs.find((o: any) => o.concept.concept_name[0].name == 'Refer Type Other')?.value_text; //165189
              }
            } else {
              completeReason = "Labor Complete";
              birthOutcome = visit.encounters[x].obs.find((o: any) => o.concept.concept_name[0].name == 'Birth Outcome')?.value_text; //163206
              if (birthOutcome == 'Other' || birthOutcome == 'OTHER') {
                birthOutcomeOther = visit.encounters[x].obs.find((o: any) => o.concept.concept_name[0].name == 'Birth Outcome Other')?.value_text; //165188_
              }
              motherDeceased = visit.encounters[x].obs.find((o: any) => o.concept.concept_name[0].name == 'MOTHER DECEASED NEW')?.value_text; //165191
              if (motherDeceased == 'YES') {
                motherDeceasedReason = visit.encounters[x].obs.find((o: any) => o.concept.concept_name[0].name == 'MOTHER DECEASED REASON')?.value_text;//165187
              }
              dateTimeOfBirth = visit.encounters[x].encounter_datetime.replace('Z','+0530');
            }
          }
        }
      }

      if (!completeReason) {
        completeReason = "Ended";
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

    provider = visit.encounters[0]?.encounter_provider?.provider.person.person_name.given_name + ' ' + visit.encounters[0]?.encounter_provider?.provider.person.person_name.family_name || 'NA';

    return {
      in_labour_duration,
      stage,
      notes,
      cervixPlotX,
      descentPlotO,
      completeReason,
      outOfTimeReason,
      referTypeOtherReason,
      birthOutcome,
      birthOutcomeOther,
      motherDeceased,
      motherDeceasedReason,
      dateTimeOfBirth,
      provider,
      seen
    }
  }

  get user() {
    return JSON.parse(localStorage.getItem('user'));
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
    this.tempPaginator1.firstPage();
    this.priorityPaginator.firstPage();
  }

  applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource1.filter = filterValue.trim().toLowerCase();
    this.tempPaginator2.firstPage();
    this.normalPaginator.firstPage();
  }

  applyFilter3(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource3.filter = filterValue.trim().toLowerCase();
    this.tempPaginator3.firstPage();
    this.completedPaginator.firstPage();
  }

  clearFilter(dataSource: string) {
    switch (dataSource) {
      case 'Priority':
        this.dataSource2.filter = null;
        this.prSearchElement.nativeElement.value = "";
        break;
      case 'In-progress':
        this.dataSource1.filter = null;
        this.ipSearchElement.nativeElement.value = "";
        break;
      case 'Completed':
        this.dataSource3.filter = null;
        this.coSearchElement.nativeElement.value = "";
        break;
      default:
        break;
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

}
