import { VisitService } from 'src/app/services/visit.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EncounterService } from 'src/app/services/encounter.service';

@Component({
  selector: 'app-vital',
  templateUrl: './vital.component.html',
  styleUrls: ['./vital.component.css']
})
export class VitalComponent implements OnInit {
answer: any = [];
v: any = [];
vitalsPresent = false;
  constructor(private route: ActivatedRoute,
              private visitService: VisitService,
              private service: EncounterService) { }

  ngOnInit() {
    const visitUuid = this.route.snapshot.paramMap.get('visit_id');
      this.visitService.fetchVisitDetails(visitUuid)
      .subscribe(visits => {
        visits.encounters.forEach(visit => {
          const display = visit.display;
          if (visit.display.match('Vitals') !== null ) {
            this.vitalsPresent = true;
            this.answer.date = display.split(' ')[1];
            const vitalUUID = visit.uuid;
            this.service.vitals(vitalUUID)
            .subscribe(vitals => {
              const vital = vitals.obs;
              vital.forEach(obs => {
                const displayObs = obs.display;
                if (displayObs.match('SYSTOLIC') !== null ) {
                  this.answer.sbp = localStorage.getItem('selectedLanguage') === 'ru' ? 
                  this.getTranslatedValue(Number(obs.display.slice(25, obs.display.length))) :
                  Number(obs.display.slice(25, obs.display.length));
                }
                if (displayObs.match('DIASTOLIC') !== null ) {
                  this.answer.dbp = localStorage.getItem('selectedLanguage') === 'ru' ? 
                  this.getTranslatedValue(Number(obs.display.slice(26, obs.display.length))) :
                  Number(obs.display.slice(26, obs.display.length));
                }
                if (displayObs.match('Weight') !== null ) {
                  this.answer.weight = localStorage.getItem('selectedLanguage') === 'ru' ? 
                  this.getTranslatedValue(Number(obs.display.slice(13, obs.display.length))):
                  Number(obs.display.slice(13, obs.display.length));
                }
                if (displayObs.match('Height') !== null ) {
                  this.answer.height = localStorage.getItem('selectedLanguage') === 'ru' ? 
                  this.getTranslatedValue(Number(obs.display.slice(13, obs.display.length))) :
                  Number(obs.display.slice(13, obs.display.length));
                }
                if (displayObs.match('BLOOD OXYGEN SATURATION') !== null ) {
                  this.answer.sp02 = localStorage.getItem('selectedLanguage') === 'ru' ? 
                  this.getTranslatedValue(Number(obs.display.slice(25, obs.display.length))) :
                  Number(obs.display.slice(25, obs.display.length));
                }
                if (displayObs.match('TEMP') !== null ) {
                  let temp = Number(obs.display.slice(17, obs.display.length));
                  this.answer.temp = localStorage.getItem('selectedLanguage') === 'ru' ?
                  this.getTranslatedValue(temp > 0 ? temp.toFixed(2) : 0): (temp> 0 ? temp.toFixed(2) : 0); 
                }
                if (displayObs.match('Pulse') !== null ) {
                  this.answer.pulse = localStorage.getItem('selectedLanguage') === 'ru' ? 
                  this.getTranslatedValue(Number(obs.display.slice(7, obs.display.length))) :
                  Number(obs.display.slice(7, obs.display.length));
                }
                if (displayObs.match('Respiratory rate') !== null ) {
                  this.answer.respiratoryRate =  localStorage.getItem('selectedLanguage') === 'ru' ? 
                  this.getTranslatedValue(Number(obs.display.slice(18, obs.display.length))) :
                  Number(obs.display.slice(18, obs.display.length));
                }
                if (displayObs.match('Abdominal Girth') !== null ) {
                  this.answer.abdominalGirth = Number(obs.display.slice(17, obs.display.length));
                }
                if (displayObs.match('Arm Girth') !== null ) {
                  this.answer.armGirth = Number(obs.display.slice(11, obs.display.length));
                }
              });
              if(this.answer.height && this.answer.weight) {
                this.answer.bmi = localStorage.getItem('selectedLanguage') === 'ru' ? 
                this.getTranslatedValue((this.answer.weight.replace(',', '.')/((this.answer.height.replace(',', '.')/100)*(this.answer.height.replace(',', '.')/100))).toFixed(2)):
                (this.answer.weight/((this.answer.height/100)*(this.answer.height/100))).toFixed(2);
              }
              this.v.push(this.answer);
            });
          }
        });
      });
  }

  getTranslatedValue(value) {
    return value.toString().replace(/\./g, ',')
  }

}
