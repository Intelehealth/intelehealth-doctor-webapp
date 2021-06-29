import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VisitService } from 'src/app/services/visit.service';
import { environment } from '../../../../environments/environment';
import * as moment from "moment";
import { DatePipe } from "@angular/common";
import { DiagnosisService } from 'src/app/services/diagnosis.service';

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
  images: any = [];
  patientDocumentPresent = false;
  conceptAdditionlDocument = '07a816ce-ffc0-49b9-ad92-a1bf9bf5e2ba';

  constructor(private route: ActivatedRoute,
    private visitService: VisitService,
    private datePipe: DatePipe,
    private diagnosisService: DiagnosisService
  ) { }

  ngOnInit() {
    const uuid = this.route.snapshot.paramMap.get('patient_id');
    this.diagnosisService.getObs(uuid, this.conceptAdditionlDocument)
      .subscribe(response => {
        response.results.forEach(obs => {
          // if (obs.encounter !== null && obs.encounter.visit.uuid === visitUuid) {
          this.patientDocumentPresent = true;
          const data = {
            image: `${this.baseURL}/obs/${obs.uuid}/value`
          };
          this.images.push(data);
          // }
        });
      });


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
