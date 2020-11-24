import { Component, OnInit } from '@angular/core';
import { ImagesService } from 'src/app/services/images.service';
import { ActivatedRoute } from '@angular/router';
import { VisitService } from 'src/app/services/visit.service';
import { environment } from '../../../../environments/environment';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';

@Component({
  selector: 'app-patientinfo',
  templateUrl: './patientinfo.component.html',
  styleUrls: ['./patientinfo.component.css'],
  providers: [DatePipe]
})

export class PatientinfoComponent implements OnInit {
baseURL = environment.baseURL;
image: string;
patientInfo = [];
patientIdentifier: string;
info = {};
profileImagePresent = false;
now: any

constructor(private route: ActivatedRoute,
            private visitService: VisitService,
            private service: ImagesService,
            private datePipe: DatePipe) { }

  ngOnInit() {
      const uuid = this.route.snapshot.paramMap.get('patient_id');
      this.service.fetchProfileImage(uuid)
      .subscribe(response => {
        this.profileImagePresent = true;
        this.image = `${this.baseURL}/personimage/${uuid}`;
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
          }
        });
        this.patientInfo.push(this.info);
      });
    }

    getAge(dateString) {
      var mydate = dateString.replace(
        /^(\d{2})\/(\d{2})\/(\d{4})$/,
        "$3, $2, $1"
      );
  
      this.now = new Date();
      var todayDate = this.datePipe.transform(this.now, "yyyy, MM, dd");
  
      var a = moment([todayDate]);
      var b = moment([mydate]);
  
      var diffDuration = moment.duration(a.diff(b));
      var ageString = diffDuration.years() + " years - " + diffDuration.months() + " months - " + diffDuration.days() + " days";
      return ageString;
  }
}
