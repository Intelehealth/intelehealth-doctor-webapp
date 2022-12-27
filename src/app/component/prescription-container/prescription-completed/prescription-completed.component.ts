import { Component, OnInit, ViewChild } from '@angular/core';

import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { VisitService } from 'src/app/services/visit.service';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-prescription-completed',
  templateUrl: './prescription-completed.component.html',
  styleUrls: ['./prescription-completed.component.scss']
})
export class PrescriptionCompletedComponent implements OnInit {

  items = ["Completed Visits"];
  expandedIndex = 0;
  displayedColumns: string[] = ['name', 'age', 'visit_created', 'location', 'cheif_complaint', 'prescription_sent'];
  dataSource = new MatTableDataSource<any>();
  completedVisits: any = [];
  baseUrl: string = environment.baseURL;
  isLoading: boolean = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(private visitService: VisitService) { }

  ngOnInit(): void {
    this.getCompletedVisits();
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  getCompletedVisits() {
    this.isLoading = true;
    this.visitService.getVisits({}).subscribe((res: any) =>{
      if (res) {
        res.results.forEach((visit: any) => {
          visit.encounters.forEach((encounter: any) => {
            if (encounter.encounterType.display == 'Visit Complete') {
              visit.prescription_sent = this.checkIfDateOldThanOneDay(encounter.encounterDatetime);
              visit.cheif_complaint = this.getCheifComplaint(visit);
              this.completedVisits.push(visit);
            }
          });
        });
        this.dataSource = new MatTableDataSource(this.completedVisits);
        this.dataSource.paginator = this.paginator;
        this.visitService.addCompltedVisitsCount(this.completedVisits.length);
        this.isLoading = false;
      }
    });
  }

  checkIfDateOldThanOneDay(data: any) {
    let hours = moment().diff(moment(data), 'hours');
    let minutes = moment().diff(moment(data), 'minutes');
    if(hours > 24) {
      return moment(data).format('DD MMM, YYYY');
    };
    if (hours < 1) {
      return `${minutes} minutes ago`;
    }
    return `${hours} hrs ago`;
  }

  getCheifComplaint(visit: any) {
    let recent: any = [];
    const encounters = visit.encounters;
    encounters.forEach(encounter => {
      const display = encounter.display;
      if (display.match('ADULTINITIAL') !== null) {
        const obs = encounter.obs;
        obs.forEach(currentObs => {
          if (currentObs.display.match('CURRENT COMPLAINT') !== null) {
            const currentComplaint = currentObs.display.split('<b>');
            for (let i = 1; i < currentComplaint.length; i++) {
              const obs1 = currentComplaint[i].split('<');
              if (!obs1[0].match('Associated symptoms')) {
                recent.push(obs1[0]);
              }
            }
          }
        });
      }
    });
    return recent;
  }

}
