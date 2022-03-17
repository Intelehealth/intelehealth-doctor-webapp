import { DiagnosisService } from './../../../services/diagnosis.service';
import { VisitService } from './../../../services/visit.service';
import { Component, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { FormGroup, FormControl } from '@angular/forms';
declare var getFromStorage: any;

@Component({
  selector: 'app-eyeform',
  templateUrl: './eyeform.component.html',
  styleUrls: ['./eyeform.component.css']
})
export class EyeformComponent implements OnInit {
  data: Array<any> = [];
  showSubmitButton: Boolean = false;
  accuityandpinholeright: Array<any> = [];
  accuityandpinholeleft: Array<any> = [];
  patientcomplaintright: Array<any> = [];
  patientcomplaintleft: Array<any> = [];
  diagnosisleft: Array<any> = [];
  diagnosisright: Array<any> = [];
  processVisitData: Array<any> = [];
  filterData: Array<any> = [];
  filterDataPhone: Array<any> = [];
  telConceptId: String = '14d4f066-15f5-102d-96e4-000c29c2a5d7';
  campConceptId: String = '00784346-7f86-43ea-a40b-608d6deacfab';
  selectedPatient: any;
  eyeCampObs: String = '2ca97364-8945-4a64-985b-b3daad7343e3';
  encounterId: String = '57a72d47-2b0a-4cb9-a1cf-87ab75d406d9';

  eyeCampForm = new FormGroup({
    accuityLeft: new FormControl(''),
    accuityRight: new FormControl(''),
    pinholeLeft: new FormControl(''),
    pinholeRight: new FormControl(''),
    complaintLeft: new FormControl(''),
    complaintRight: new FormControl(''),
    diagnosisLeft: new FormControl(''),
    diagnosisRight: new FormControl(''),
    referral: new FormControl(''),
    referralTime: new FormControl(''),
    ophthalmologist: new FormControl('')
  });
  constructor(
    private visitService: VisitService,
    private encounterService: EncounterService,
    private diagnosisService: DiagnosisService
  ) { }

  ngOnInit(): void {
    this.constructVisuityAcuityAndPinholeAcuity();
    this.constructPatientComplaint();
    this.constructDiagnosis();
    this.getAllVisits();
  }

  processForm(value) {
    value = JSON.parse(value);
    this.eyeCampForm.setValue({
      accuityLeft: value.acuity.left,
      accuityRight: value.acuity.right,
      pinholeLeft: value.pinhole.left,
      pinholeRight: value.pinhole.right,
      complaintLeft: value.complaint.left,
      complaintRight: value.complaint.right,
      diagnosisLeft: value.diagnosis.left,
      diagnosisRight: value.diagnosis.right,
      referral: value.referral.value,
      referralTime: value.referral.time,
      ophthalmologist: value.ophthalmologist
    });
  }

  getAllVisits() {
    this.visitService.getVisits(true)
      .subscribe(visits => {
        visits.results.forEach(visit => {
          this.processVisitData.push({
            visit_uuid: visit.uuid,
            patient_uuid: visit.patient.uuid,
            patient: visit.patient,
            phoneno: visit.patient.person.attributes.filter(attri => attri.attributeType.uuid === this.telConceptId)[0] || {},
            eye_camp_id: visit.patient.person.attributes.filter(attri => attri.attributeType.uuid === this.campConceptId)[0] || {}
          });
        });
        this.filterData = this.processVisitData;
        this.filterDataPhone = this.processVisitData;
      });
  }

  constructVisuityAcuityAndPinholeAcuity() {
    this.accuityandpinholeright.push(
      { value: '<6/6', name: 'Right eye: <6/6' },
      { value: '6/6', name: 'Right eye: 6/6' },
      { value: '6/9', name: 'Right eye: 6/9' },
      { value: '6/12', name: 'Right eye: 6/12' },
      { value: '6/18', name: 'Right eye: 6/18' },
      { value: '6/24', name: 'Right eye: 6/24' },
      { value: '6/36', name: 'Right eye: 6/36' },
      { value: '6/60', name: 'Right eye: 6/60' },
      { value: 'Hand movements', name: 'Right eye: Hand movements' },
      { value: 'Light perception only', name: 'Right eye: Light perception only' },
      { value: 'No light perception', name: 'Right eye: No light perception' }
    );
    this.accuityandpinholeleft.push(
      { value: '<6/6', name: 'Left eye: <6/6' },
      { value: '6/6', name: 'Left eye: 6/6' },
      { value: '6/9', name: 'Left eye: 6/9' },
      { value: '6/12', name: 'Left eye: 6/12' },
      { value: '6/18', name: 'Left eye: 6/18' },
      { value: '6/24', name: 'Left eye: 6/24' },
      { value: '6/36', name: 'Left eye: 6/36' },
      { value: '6/60', name: 'Left eye: 6/60' },
      { value: 'Hand movements', name: 'Left eye: Hand movements' },
      { value: 'Light perception only', name: 'Left eye: Light perception only' },
      { value: 'No light perception', name: 'Left eye: No light perception' }
    );
  }

  constructPatientComplaint() {
    this.patientcomplaintright.push(
      { value: 'Blurry Vision Up Close', name: 'Right eye' },
      { value: 'Blurry Vision Far Away', name: 'Right eye' },
      { value: 'Redness', name: 'Right eye' },
      { value: 'Eye Pain or Irritation', name: 'Right eye' },
      { value: 'Headache', name: 'Right eye' },
      { value: 'Eye Trauma', name: 'Right eye' },
      { value: 'PC IOL', name: 'Right eye' },
      { value: 'Other', name: 'Right eye' },
    );
    this.patientcomplaintleft.push(
      { value: 'Blurry Vision Up Close', name: 'Left eye' },
      { value: 'Blurry Vision Far Away', name: 'Left eye' },
      { value: 'Redness', name: 'Left eye' },
      { value: 'Eye Pain or Irritation', name: 'Left eye' },
      { value: 'Headache', name: 'Left eye' },
      { value: 'Eye Trauma', name: 'Left eye' },
      { value: 'PC IOL', name: 'Left eye' },
      { value: 'Other', name: 'Left eye' },
    );
  }

  constructDiagnosis() {
    this.diagnosisright.push(
      { value: 'Normal Eye Exam', name: 'Right eye' },
      { value: 'Refractive Error/Presbiopia', name: 'Right eye' },
      { value: 'Immature Cataract', name: 'Right eye' },
      { value: 'Mature Cataract', name: 'Right eye' },
      { value: 'Inactive Corneal Opacity', name: 'Right eye' },
      { value: 'Active Corneal Infection', name: 'Right eye' },
      { value: 'Pterygium', name: 'Right eye' },
      { value: 'Other', name: 'Right eye' },
    );
    this.diagnosisleft.push(
      { value: 'Normal Eye Exam', name: 'Left eye' },
      { value: 'Refractive Error/Presbiopia', name: 'Left eye' },
      { value: 'Immature Cataract', name: 'Left eye' },
      { value: 'Mature Cataract', name: 'Left eye' },
      { value: 'Inactive Corneal Opacity', name: 'Left eye' },
      { value: 'Active Corneal Infection', name: 'Left eye' },
      { value: 'Pterygium', name: 'Left eye' },
      { value: 'Other', name: 'Left eye' },
    );
  }

  selected(value) {
    const data = this.filterData.filter(uuid => uuid.patient_uuid === value);
    this.selectedPatient = data[0];
    if (this.selectedPatient) {
      this.diagnosisService.getObs(this.selectedPatient.patient_uuid, this.eyeCampObs)
      .subscribe(response => {
        if (response.results.length) {
          response.results.forEach(obs => {
            if (obs.encounter && obs.encounter.visit.uuid === this.selectedPatient.visit_uuid) {
              this.showSubmitButton = false;
              this.processForm(obs.value);
            } else {
              this.showSubmitButton = true;
            }
          });
        } else {
          this.showSubmitButton = true;
        }
      });
    }
  }

  _filter(value: string) {
    const filterValue = value.toLowerCase();
    this.filterData = this.processVisitData.filter(campid => campid.eye_camp_id?.value?.toLowerCase().includes(filterValue));
  }

  _filterPhone(value: string) {
    const filterValue = value.toLowerCase();
    this.filterDataPhone = this.processVisitData.filter(phone => phone.phoneno?.value?.toLowerCase().includes(filterValue));
  }

  Save() {
    const value = this.processData(this.eyeCampForm.value);
    const date = new Date();
    const providerDetails = getFromStorage('provider');
    const providerUuid = providerDetails.uuid;
    if (this.selectedPatient?.patient_uuid && providerUuid) {
      const json = {
        patient: this.selectedPatient.patient_uuid,
        encounterType: this.encounterId,
        encounterProviders: [{
          provider: providerUuid,
          encounterRole: '64538a7f-ca93-47b6-bbdf-06450ca11247'
          }],
        visit: this.selectedPatient.visit_uuid,
        encounterDatetime: date,
        obs: [{
          concept: this.eyeCampObs,
          value: JSON.stringify(value)
        }],
      };
      this.encounterService.postEncounter(json).subscribe(response => {
        this.showSubmitButton = false;
      });
    }
  }

  processData(data) {
    const formInfo = {
      acuity: {
        left: data.accuityLeft,
        right: data.accuityRight
      },
      pinhole: {
        left: data.pinholeLeft,
        right: data.pinholeRight
      },
      complaint: {
        left: data.complaintLeft,
        right: data.complaintRight
      },
      diagnosis: {
        left: data.diagnosisLeft,
        right: data.diagnosisRight
      },
      referral: {
        value: data.referral,
        time: data.referralTime
      },
      ophthalmologist: data.ophthalmologist
    };
    return formInfo;
  }
}
