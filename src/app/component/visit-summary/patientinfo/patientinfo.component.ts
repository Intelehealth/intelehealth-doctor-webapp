import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VisitService } from 'src/app/services/visit.service';
import { environment } from '../../../../environments/environment';


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

constructor(private route: ActivatedRoute,
            private visitService: VisitService) { }

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
}
