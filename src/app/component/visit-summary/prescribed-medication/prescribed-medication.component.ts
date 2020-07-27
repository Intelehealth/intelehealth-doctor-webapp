import { Component, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DiagnosisService } from '../../../services/diagnosis.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material';
declare var getEncounterProviderUUID: any, getFromStorage: any, getEncounterUUID: any;

@Component({
  selector: 'app-prescribed-medication',
  templateUrl: './prescribed-medication.component.html',
  styleUrls: ['./prescribed-medication.component.css'],
  animations: [
    trigger('moveInLeft', [
       transition('void=> *', [style({transform: 'translateX(300px)'}),
         animate(200, keyframes ([
          style({transform: 'translateX(300px)'}),
          style({transform: 'translateX(0)'})
           ]))]),
    transition('*=>void', [style({transform: 'translateX(0px)'}),
         animate(100, keyframes([
          style({transform: 'translateX(0px)'}),
          style({transform: 'translateX(300px)'})
        ]))])
     ])
 ]
})
export class PrescribedMedicationComponent implements OnInit {
meds: any = [];
add = false;
encounterUuid: string;
patientId: string;
visitUuid: string;
conceptPrescription = [];
conceptDose = [];
conceptfrequency = [];
conceptAdministration = [];
conceptDurationUnit = [];
conceptMed = 'c38c0c50-2fd2-4ae3-b7ba-7dd25adca4ca';

medForm = new FormGroup({
  med: new FormControl('', [Validators.required]),
  dose: new FormControl('', Validators.min(1)),
  unit: new FormControl('', [Validators.required]),
  amount: new FormControl('', Validators.min(1)),
  unitType: new FormControl('', [Validators.required]),
  frequency: new FormControl('', [Validators.required]),
  route: new FormControl(''),
  reason: new FormControl(''),
  duration: new FormControl('', Validators.min(1)),
  durationUnit: new FormControl('', [Validators.required]),
  additional: new FormControl('')
});

  constructor(private service: EncounterService,
              private diagnosisService: DiagnosisService,
              private snackbar: MatSnackBar,
              private route: ActivatedRoute) { }

    searchPrescription = (text$: Observable<string>) =>
      text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
      : this.conceptPrescription.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )

    searchFrequency = (text$: Observable<string>) =>
      text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
      : this.conceptfrequency.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )

    searchAdministration = (text$: Observable<string>) =>
      text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
      : this.conceptAdministration.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )

    searchDose = (text$: Observable<string>) =>
      text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
      : this.conceptDose.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )

    durationUnit = (text$: Observable<string>) =>
      text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
      : this.conceptDurationUnit.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )

  ngOnInit() {
    const prescriptionUuid = 'c25ea0e9-6522-417f-97ec-6e4b7a615254';
    this.diagnosisService.concept(prescriptionUuid)
    .subscribe(res => {
      const result = res.answers;
      result.forEach(ans => {
        this.conceptPrescription.push(ans.display);
      });
    });
    const doseUnit = '162384AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    this.diagnosisService.concept(doseUnit)
    .subscribe(res => {
      const result = res.setMembers;
      result.forEach(ans => {
        this.conceptDose.push(ans.display);
      });
    });
    const frequency = '9847b24f-8434-4ade-8978-157184c435d2';
    this.diagnosisService.concept(frequency)
    .subscribe(res => {
      const result = res.setMembers;
      result.forEach(ans => {
        this.conceptfrequency.push(ans.display);
      });
    });
    const RouteOfAdministration = '162394AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    this.diagnosisService.concept(RouteOfAdministration)
    .subscribe(res => {
      const result = res.setMembers;
      result.forEach(ans => {
        this.conceptAdministration.push(ans.display);
      });
    });
    const conceptDurationUnit = '1732AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    this.diagnosisService.concept(conceptDurationUnit)
    .subscribe(res => {
      const result = res.setMembers;
      result.forEach(ans => {
        this.conceptDurationUnit.push(ans.display);
      });
    });
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptMed)
    .subscribe(response => {
      response.results.forEach(obs => {
        if (obs.encounter.visit.uuid === this.visitUuid) {
          this.meds.push(obs);
        }
      });
    });
  }

  onSubmit() {
    const date = new Date();
    const value = this.medForm.value;
    // tslint:disable-next-line:max-line-length
    var insertValue = `${value.med}: ${value.dose} ${value.unit}, ${value.amount} ${value.unitType} ${value.frequency}`;
    if (value.route) {
    insertValue = `${insertValue} (${value.route})`;
    }
    if (value.reason) {
    insertValue = `${insertValue} ${value.reason}`;
    }
      insertValue = `${insertValue} for ${value.duration} ${value.durationUnit}`;
    if (value.additional) {
      insertValue = `${insertValue} ${value.additional}`;
    } else {
      insertValue = `${insertValue}`;
    }
    const providerDetails = getFromStorage('provider');
    const providerUuid = providerDetails.uuid;
    if (providerDetails && providerUuid ===  getEncounterProviderUUID()) {
      this.encounterUuid = getEncounterUUID();
      const json = {
        concept: this.conceptMed,
        person: this.patientId,
        obsDatetime: date,
        value: insertValue,
        encounter: this.encounterUuid
      };
      this.service.postObs(json)
      .subscribe(response => {
      this.meds.push({uuid: response.uuid, value: insertValue});
      this.add = false;
      });
    } else {this.snackbar.open('Another doctor is viewing this case', null, {duration: 4000}); }
  }

  delete(i) {
    const uuid = this.meds[i].uuid;
    this.diagnosisService.deleteObs(uuid)
    .subscribe(res => {
      this.meds.splice(i, 1);
    });
  }

}
