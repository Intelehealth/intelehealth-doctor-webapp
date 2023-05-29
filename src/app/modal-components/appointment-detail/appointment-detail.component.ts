import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VisitService } from 'src/app/services/visit.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-appointment-detail',
  templateUrl: './appointment-detail.component.html',
  styleUrls: ['./appointment-detail.component.scss']
})
export class AppointmentDetailComponent implements OnInit {

  baseUrl: string = environment.baseURL;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AppointmentDetailComponent>,
    private visitService: VisitService,
    private translate:TranslateService) { }

  ngOnInit(): void {
    if (this.data?.title == 'Appointment') {
      this.visitService.fetchVisitDetails(this.data.id).subscribe((visit: any)=> {
        this.data.meta.visit_info = visit;
        let cdata = this.getCheifComplaint(visit);
        this.data.meta.cheif_complaint = cdata.complaint;
        this.data.meta.visit_status = this.checkVisitStatus(visit.encounters);
        this.data.meta.starts_in = this.checkIfDateOldThanOneDay(this.data?.meta.slotJsDate);
        this.data.meta.hwPhoneNo = cdata.hwPhoneNo;
        this.data.meta.prescriptionCreatedAt = cdata.prescriptionCreatedAt;

      });
    } else if (this.data?.title == 'Follow-up visit') {
      let cdata = this.getCheifComplaint(this.data?.meta.visit_info);
      this.data.meta.cheif_complaint = cdata.complaint;
      this.data.meta.visit_status = this.checkVisitStatus(this.data?.meta.visit_info.encounters);
      this.data.meta.starts_in = this.checkIfDateOldThanOneDay(this.data?.meta.slotJsDate);
      this.data.meta.hwPhoneNo = cdata.hwPhoneNo;
      this.data.meta.prescriptionCreatedAt = cdata.prescriptionCreatedAt;
    }
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  checkIfDateOldThanOneDay(data: any) {
    let hours = moment(data).diff(moment(), 'hours');
    let minutes = moment(data).diff(moment(), 'minutes');
    // console.log(hours, minutes);
    if(hours > 24) {
      return `${this.translate.instant('Starts in')} ${Math.round(hours/24)} ${this.translate.instant('days')}`;
    };
    if (hours < 1) {
      if (hours < -24) {
        return `${this.translate.instant('Awaiting since')} ${Math.round(-hours/24)} ${this.translate.instant('days')}`;
      } else if (hours < 0 && hours > -24) {
        return `${this.translate.instant('Awaiting since')} ${-hours} ${this.translate.instant('hrs')}`;
      } else if (hours == 0 && minutes < 0) {
        return `${this.translate.instant('Awaiting since')} ${-minutes} ${this.translate.instant('minutes')}`;
      }
      return `${this.translate.instant('Starts in')} ${minutes} ${this.translate.instant('minutes')}`;
    }
    return `${this.translate.instant('Starts in')} ${hours} ${this.translate.instant('hrs')}`;
  }

  getCheifComplaint(visit: any) {
    let recent: any = [];
    let hwPhoneNo: any = '';
    let prescriptionCreatedAt: any = '';

    const encounters = visit.encounters;
    encounters.forEach((encounter: any) => {
      const display = encounter.display;
      if (display.match('ADULTINITIAL') !== null) {
        const obs = encounter.obs;
        obs.forEach((currentObs: any) => {
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
        const providerAttribute = encounter.encounterProviders[0].provider.attributes;
        if (providerAttribute.length) {
          providerAttribute.forEach((attribute: any) => {
            if (attribute.display.match("phoneNumber") != null) {
              hwPhoneNo = attribute.value;
            }
          });
        }
      }
      if (display.match('Visit Complete') !== null) {
        prescriptionCreatedAt = this.checkPrescriptionCreatedAt(encounter.encounterDatetime);
      }
    });
    return { complaint: recent, hwPhoneNo, prescriptionCreatedAt };
  }

  checkVisitStatus(encounters: any) {
    if (this.checkIfEncounterExists(encounters, 'Patient Exit Survey')) {
      return 'Ended';
    } else if (this.checkIfEncounterExists(encounters, 'Visit Complete')) {
      return 'Completed';
    } else if (this.checkIfEncounterExists(encounters, 'Visit Note')) {
      return 'In-progress';
    } else if (this.checkIfEncounterExists(encounters, 'Flagged')) {
      return'Priority';
    } else if (this.checkIfEncounterExists(encounters, 'ADULTINITIAL') || this.checkIfEncounterExists(encounters, 'Vitals')) {
      return 'Awaiting';
    }
  }

  checkIfEncounterExists(encounters: any, visitType: string) {
    return encounters.find(({ display = "" }) => display.includes(visitType));
  }

  checkPrescriptionCreatedAt(data: any) {
    let hours = moment().diff(moment(data), 'hours');
    let minutes = moment().diff(moment(data), 'minutes');
    if(hours > 24) {
      return `${this.translate.instant('Prescription created')} ${Math.round(hours/24)} ${this.translate.instant('days ago')}`;
    };
    if (hours < 1) {
      return `${this.translate.instant('Prescription created')} ${minutes} ${this.translate.instant('minutes ago')}`;
    }
    return `${this.translate.instant('Prescription created')} ${hours} ${this.translate.instant('hrs ago')}`;
  }

}
