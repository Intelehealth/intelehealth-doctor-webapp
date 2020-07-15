import { VisitService } from '../../services/visit.service';
// import { MailService } from './../../services/mail.service';
import { Component, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs';
import * as jspdf from 'jspdf';
import * as domtoimage from 'dom-to-image';

@Component({
  selector: 'app-visit-summary',
  templateUrl: './visit-summary.component.html',
  styleUrls: ['./visit-summary.component.css']
})
export class VisitSummaryComponent implements OnInit {
userSubscription: Subscription;
show = false;
text: string;
font: string;
visitNotePresent = false;
visitCompletePresent = false;
setSpiner = true;
disableButton = false;
prescription; prescriptionValue; doctorDetails; doctorValue; patientValue; visitUuid; patientUuid;


constructor(private service: EncounterService,
            private visitService: VisitService,
            // private mailService: MailService,
            private snackbar: MatSnackBar,
            private route: ActivatedRoute,
            private router: Router) {
              this.router.routeReuseStrategy.shouldReuseRoute = function() {
                return false;
            };
            }

  ngOnInit() {
    setTimeout(() => {this.setSpiner = false; }, 1000);
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientUuid = this.route.snapshot.paramMap.get('patient_id');
    this.visitService.fetchVisitDetails(this.visitUuid)
    .subscribe(visitDetails => {
      visitDetails.encounters.forEach(visit => {
        if (visit.display.match('Visit Note') !== null) {
          this.visitNotePresent = true;
          this.show = true;
        }
        if (visit.display.match('Visit Complete') !== null) {
          this.visitCompletePresent = true;
          visit.encounterProviders[0].provider.attributes.forEach(element => {
            if (element.attributeType.display === 'textOfSign') {
              this.text = element.value;
            } if (element.attributeType.display === 'fontOfSign') {
              this.font = element.value;
            }
          });
        }
      });
    });
  }

  onStartVisit() {
    this.disableButton = true;
    const myDate = new Date(Date.now() - 30000);
      if (!this.visitNotePresent) {
        this.service.session()
        .subscribe(session => {
          const userUuid = session.user.uuid;
          this.service.provider(userUuid)
          .subscribe(provider => {
            const providerUuid = provider.results[0].uuid;
            const json = {
              patient: this.patientUuid,
              encounterType: 'd7151f82-c1f3-4152-a605-2f9ea7414a79',
              encounterProviders: [{
                provider: providerUuid,
                encounterRole: '73bbb069-9781-4afc-a9d1-54b6b2270e03'
              }],
              visit: this.visitUuid,
              encounterDatetime: myDate
            };
            this.service.postEncounter(json)
            .subscribe(response => {
              if (response) {
                this.show = true;
                this.snackbar.open(`Visit Note Created`, null, {
                  duration: 4000
                });
              }
            }, err => {
              this.disableButton = false;
              this.snackbar.open(`Visit Note Not Created`, null, {duration: 4000});
            });
          });
        });
      }
  }

  sign() {
    const myDate = new Date(Date.now() - 30000);
    this.service.session()
    .subscribe(response => {
      this.service.provider(response.user.uuid)
      .subscribe(user => {
        this.doctorDetails = user.results[0];
        this.getDoctorValue();
        const providerUuid = user.results[0].uuid;
        this.service.signRequest(providerUuid)
        .subscribe(res => {
          if (res.results.length) {
            res.results.forEach(element => {
              if (element.attributeType.display === 'textOfSign') {
                this.text = element.value;
              } if (element.attributeType.display === 'fontOfSign') {
                this.font = element.value;
              }
            });
            const json = {
              patient: this.patientUuid,
              encounterType: 'bd1fbfaa-f5fb-4ebd-b75c-564506fc309e',
              encounterProviders: [{
                provider: providerUuid,
                encounterRole: '73bbb069-9781-4afc-a9d1-54b6b2270e03'
                }],
              visit: this.visitUuid,
              encounterDatetime: myDate,
              obs: [{
                concept: '7a9cb7bc-9ab9-4ff0-ae82-7a1bd2cca93e',
                value: JSON.stringify(this.doctorValue)
              }],
            };
            this.service.postEncounter(json)
            .subscribe(post => {
              this.visitCompletePresent = true;
              this.snackbar.open('Visit Complete', null, {duration: 4000});
            });
          } else {
            if (window.confirm('Your signature is not setup! If you click "Ok" you would be redirected. Cancel will load this website ')) {
              this.router.navigateByUrl('/myAccount');
            }
          }
        });
      });
    });
  }

  getDoctorValue = () => {
    const doctor = {};
    doctor['name'] = this.doctorDetails.person.display;
    // tslint:disable-next-line: max-line-length
    const doctorAttributes = ['phoneNumber', 'qualification', 'whatsapp', 'emailId', 'registrationNumber', 'specialization', 'address', 'fontOfSign', 'textOfSign'];
    doctorAttributes.forEach(attr => {
      const details = this.filterAttributes(this.doctorDetails.attributes, attr);
      if (details.length) {
        doctor[attr] = details[details.length - 1 ].value;
      }
    });
    this.doctorValue = doctor;
    this.getPatientInfo();
  }

  getPatientInfo = () => {
    const patient = {};
    const promise = new Promise((resolve, reject) => {
      this.visitService.patientInfo(this.patientUuid)
      .subscribe(response => {
        if (response) {
          const {display, preferredAddress, age, attributes, gender} = response.person;
          patient['date'] =  new Date();
          patient['name'] =  display;
          patient['address'] = preferredAddress;
          patient['age'] = age;
          patient['gender'] = gender;
          if (attributes) {
            const phone = this.filterAttributes(attributes, 'Telephone Number');
            if (phone.length) {
              patient['phone'] = this.filterAttributes(attributes, 'Telephone Number')[0].value;
              resolve(patient);
            } else {resolve(patient); }
          } else {resolve(patient); }
        }
      });
    });
    promise.then(response => {
      this.patientValue = response;
      this.getDiagnosis();
    });
  }

  getDiagnosis = () => {
    let html = ``;
    const ids = ['presentComplaint', 'diagnosis', 'medication', 'prescribedTest', 'advice', 'followUp'];
    ids.forEach(id => {
      const prescriptionFragment = document.querySelector(`#${id}`);
      if (prescriptionFragment) {
        const fragmentName = this.camelToString(id);
        if (id === 'presentComplaint') {
          // tslint:disable-next-line: max-line-length
          html += `<div class="diagnosis"><div><b><u>${fragmentName}:</u></b></div><div [innerHTML]=${prescriptionFragment.textContent}></div></div><br>`;
        } else {
          let temp = ``;
          prescriptionFragment.querySelectorAll('.doctor-value').forEach(value => {
            temp += `<div>${value.textContent}</div>`;
          });
          html += `<div class="diagnosis"><div><b><u>${fragmentName}: </u></b></div><div>${temp}</div></div><br>`;
        }
      }
    });
    this.prescriptionValue = html;
    this.prescription = true;
    // setTimeout(() => this.convetToPDF(), 1000);
  }

  filterAttributes = (data, text) => {
    return data.filter(attr => attr.attributeType['display'].toLowerCase() === text.toLowerCase());
  }

  camelToString = (text) => {
    const result = text.replace( /([A-Z])/g, ' $1' );
    const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult;
  }

  // convetToPDF = () =>  {
  //   const element = document.getElementById('prescription');
  //   domtoimage.toPng(element)
  //   .then((dataUrl) => {
  //       const doc = new jspdf();
  //       doc.addImage(dataUrl, 'JPEG', 15, 20, 180, 160);
  //       doc.save('abc.pdf');
  //       const pdf = doc.output();
  //       const data = {
  //         prescription: btoa(pdf)
  //       };
  //       this.prescription = false;
  //       this.mailService.sendMail(data)
  //       .subscribe(response => {});
  //   })
  //   .catch(function (error) {
  //       console.error('oops, something went wrong!', error);
  //   });
  // }


}

