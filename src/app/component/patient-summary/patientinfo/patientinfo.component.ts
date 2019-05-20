import { Component, OnInit } from '@angular/core';
import { ImagesService } from 'src/app/services/images.service';
import { ActivatedRoute } from '@angular/router';
import { VisitService } from 'src/app/services/visit.service';

@Component({
  selector: 'app-patientinfo',
  templateUrl: './patientinfo.component.html',
  styleUrls: ['./patientinfo.component.css']
})

export class PatientinfoComponent implements OnInit {
image: string;
patientInfo = [];
info = {};
profileImagePresent = false;

constructor(private route: ActivatedRoute,
            private visitService: VisitService,
            private service: ImagesService) { }

  ngOnInit() {
      const uuid = this.route.snapshot.paramMap.get('patient_id');
      this.service.fetchProfileImage(uuid)
      .subscribe(response => {
        if (response.results.length !== 0) {
          this.profileImagePresent = true;
          this.image = response.results[0].Image.url;
         }
      });
      this.visitService.patientInfo(uuid)
      .subscribe(info => {
        this.info = info.person;
        this.info['attributes'].forEach(attri => {
          if (attri.attributeType.display.match('Telephone Number')) {
            this.info['telephone'] = attri.value;
          }
        });
        this.patientInfo.push(this.info);
      });
    }
}
