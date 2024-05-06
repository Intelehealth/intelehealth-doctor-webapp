import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import { VisitService } from 'src/app/services/visit.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-hw-assessment',
  templateUrl: './hw-assessment.component.html',
  styleUrls: ['./hw-assessment.component.css'],
  animations: [
    trigger('moveInLeft', [
      transition('void=> *', [style({ transform: 'translateX(300px)' }),
      animate(200, keyframes([
        style({ transform: 'translateX(300px)' }),
        style({ transform: 'translateX(0)' })
      ]))]),
      transition('*=>void', [style({ transform: 'translateX(0px)' }),
      animate(100, keyframes([
        style({ transform: 'translateX(0px)' }),
        style({ transform: 'translateX(300px)' })
      ]))])
    ])
  ]
})
export class HwAssessmentComponent implements OnInit {
  additionalRemarks: any = [];
  patientId: string;
  visitUuid: string;
  displayedColumns: string[] = ['time_date','action', 'created_on'];
  dataSource = new MatTableDataSource<any>();
  addBy: any = [];
  locale: any = localStorage.getItem('selectedLanguage');


  constructor(
    private route: ActivatedRoute,
    private visitService: VisitService,
  ) { }

  ngOnInit(): void {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.getDispense(this.visitUuid);
  }

  getDispense(visitID:any){
    this.visitService.fetchVisitDetails(visitID)
    .subscribe(visitDetail => {
      visitDetail.encounters.filter((remark) => {
        if(remark.display.includes("ADULTINITIAL")){
          for(let i = 0; i < remark.obs.length; i++){
            if(remark.obs[i].display.includes("Additional Remarks")){
              let obsData = JSON.parse(remark.obs[i].value)
              remark.obs[i]["additional_remark"]=obsData
              this.additionalRemarks.push(remark.obs[i]);
              this.dataSource = new MatTableDataSource(this.additionalRemarks.sort((a: any, b: any) => new Date(b.additional_remark.dateTime) < new Date(a.additional_remark.dateTime) ? 1 : -1));
            }
          }
          this.addBy.push(remark.obs[0]);
        }
      });
    });
  }

  get txtDirection() {
    return localStorage.getItem("selectedLanguage") === 'ar' ? "rtl" : "ltr";
  }

  getLang() {
    return localStorage.getItem("selectedLanguage");
  }
}
