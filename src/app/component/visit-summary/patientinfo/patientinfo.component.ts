import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VisitService } from 'src/app/services/visit.service';
import { environment } from '../../../../environments/environment';
import * as moment from "moment";
import { DatePipe } from "@angular/common";

@Component({
  selector: 'app-patientinfo',
  templateUrl: './patientinfo.component.html',
  styleUrls: ['./patientinfo.component.css']
})

export class PatientinfoComponent implements OnInit {
  baseURL = environment.baseURL;
  patientInfo = [];
  patientIdentifier: string;
  info = {};
  personAge: any;
  yearAge: any;
  age: any = {};
  now: any;
  a: any;

  constructor(private route: ActivatedRoute,
    private visitService: VisitService,
    private datePipe: DatePipe
    ) { }

  ngOnInit() {
    const uuid = this.route.snapshot.paramMap.get('patient_id');
    this.visitService.patientInfo(uuid)
      .subscribe(info => {
        this.info = info.person;
        this.patientIdentifier = info.identifiers[0].identifier;
        this.info['attributes'].forEach(attri => {
          if (attri.attributeType.display.match('Telephone Number')) {
            this.info['telephone'] = attri.value;
          } else if (attri.attributeType.display.match('occupation')) {
            this.info['occupation'] = attri.value;
          } else if (attri.attributeType.display.match('Education')) {
            this.info['education'] = attri.value;
          } else if (attri.attributeType.display.match('positiveDate')) {
            this.info['positiveDate'] = attri.value;
          }
        });
        this.patientInfo.push(this.info);
      });
  }


  // getAge(dateString) {
  //   var mydate = dateString.replace(
  //     /^(\d{2})\/(\d{2})\/(\d{4})$/,
  //     "$3, $2, $1"
  //   );

  //   this.now = new Date();
  //   var todayDate = this.datePipe.transform(this.now, "yyyy, MM, dd");

  //   var a = moment(todayDate);
  //   var b = moment(mydate);
  //   var diffDuration = moment.duration(a.diff(b));
  //   var ageString =
  //     diffDuration.years() +
  //     " years" 
  //   return ageString;
  // }
}
