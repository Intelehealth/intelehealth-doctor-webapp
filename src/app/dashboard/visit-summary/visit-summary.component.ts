import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { VisitService } from 'src/app/services/visit.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';

@Component({
  selector: 'app-visit-summary',
  templateUrl: './visit-summary.component.html',
  styleUrls: ['./visit-summary.component.scss']
})
export class VisitSummaryComponent implements OnInit {

  visit: any;
  patient: any;
  baseUrl: string = environment.baseURL;

  constructor(
    private pageTitleService: PageTitleService,
    private route: ActivatedRoute,
    private router: Router,
    private visitService: VisitService) { }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: '', imgUrl: '' });
    const id = this.route.snapshot.paramMap.get('id');
    this.getVisit(id);
  }

  getVisit(uuid: string) {
    this.visitService.fetchVisitDetails(uuid, 'full').subscribe((visit: any) => {
      if (visit) {
        this.visit = visit;
        this.visitService.patientInfo(visit.patient.uuid).subscribe((patient: any) =>{
          if (patient) {
            this.patient = patient;
          }
        });
      }
    }, (error: any) => {
      this.router.navigate(['/dashboard']);
    });
  }

  getPatientIdentifier(identifierType: string) {
    if (this.patient) {
      this.patient.identifiers.forEach((idf: any) => {
        if (idf.identifierType == 'OpenMRS ID') {
          return idf.identifier;
        }
      });
    }
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  getAge(birthdate: string) {
    let years = moment().diff(birthdate, 'years');
    var months = moment().diff(birthdate, 'months');
    let days = moment().diff(birthdate, 'days');
    if (years > 1) {
      return `${years} years`;
    } else if (months > 1) {
      return `${months} months`;
    } else {
      return `${days} days`;
    }
  }

  getPersonAttributeValue(attrType: string) {
    let val = 'NA';
    if (this.patient) {
      this.patient.person.attributes.forEach((attr: any) => {
        if (attrType == attr.attributeType.display) {
          val = attr.value;
        }
      });
    }
    return val;
  }

  getWhatsAppLink() {
    return this.visitService.getWhatsappLink(this.getPersonAttributeValue('Telephone Number'),`Hello I'm calling for consultation`);
  }

}
