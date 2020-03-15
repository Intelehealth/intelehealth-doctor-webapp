import { Component, OnInit } from '@angular/core';
import { ImagesService } from 'src/app/services/images.service';
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
image: string;
patientInfo = [];
patientIdentifier: string;
info = {};
profileImagePresent = false;

constructor(private route: ActivatedRoute,
            private visitService: VisitService,
            private service: ImagesService) { }

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
          }
        });
        this.patientInfo.push(this.info);
      });
    }
}
