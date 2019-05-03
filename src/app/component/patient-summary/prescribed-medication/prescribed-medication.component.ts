import { Component, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DiagnosisService } from './../../../services/diagnosis.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-prescribed-medication',
  templateUrl: './prescribed-medication.component.html',
  styleUrls: ['./prescribed-medication.component.css']
})
export class PrescribedMedicationComponent implements OnInit {
meds: any = [];
add = false;
encounterUuid: string;
patientId: string;
conceptPrescription = [];
conceptDose = [];
conceptfrequency = [];
conceptAdministration = [];
conceptDurationUnit = [];
conceptMed = 'c38c0c50-2fd2-4ae3-b7ba-7dd25adca4ca';

medForm = new FormGroup({
  med: new FormControl('', [Validators.required]),
  dose: new FormControl('', [Validators.required]),
  unit: new FormControl('', [Validators.required]),
  frequency: new FormControl('', [Validators.required]),
  route: new FormControl(''),
  reason: new FormControl(''),
  duration: new FormControl('', [Validators.required]),
  durationUnit: new FormControl('', [Validators.required]),
  additional: new FormControl('')
});

  constructor(private service: EncounterService,
              private diagnosisService: DiagnosisService,
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
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptMed)
    .subscribe(response => {
      this.meds = response.results;
    });
  }

  onSubmit() {
    const date = new Date();
    const value = this.medForm.value;
    // tslint:disable-next-line:max-line-length
    const insertValue = `${value.med}: ${value.dose}, ${value.unit} ${value.frequency} (${value.route}) ${value.reason} for ${value.duration} ${value.durationUnit} ${value.additional}total.`;
    this.service.visitNote(this.patientId)
      .subscribe(res => {
      this.encounterUuid = res.results[0].uuid;
     const json = {
        concept: this.conceptMed,
        person: this.patientId,
        obsDatetime: date,
        value: insertValue,
        encounter: this.encounterUuid
      };
     this.service.postObs(json)
     .subscribe(response => {
      this.meds.push({value: insertValue});
      this.medForm.reset();
      this.add = false;
     });
    });
  }

  delete(i) {
    const uuid = this.meds[i].uuid;
    this.diagnosisService.deleteObs(uuid)
    .subscribe(res => {
      this.meds.splice(i, 1);
    });
  }

}
