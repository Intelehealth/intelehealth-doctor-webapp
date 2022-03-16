import { VisitService } from './../../../services/visit.service';
import { Component, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';

@Component({
  selector: 'app-eyeform',
  templateUrl: './eyeform.component.html',
  styleUrls: ['./eyeform.component.css']
})
export class EyeformComponent implements OnInit {
  data: Array<any> = [];
  accutiyandpinholeright: Array<any> = [];
  accutiyandpinholeleft: Array<any> = [];
  patientcomplaintright: Array<any> = [];
  patientcomplaintleft: Array<any> = [];
  diagnosisleft: Array<any> = [];
  diagnosisright: Array<any> = [];
  processVisitData: Array<any> = [];
  filterData: Array<any> = [];
  telConceptId: String = '14d4f066-15f5-102d-96e4-000c29c2a5d7';
  campConceptId: String = '00784346-7f86-43ea-a40b-608d6deacfab';
  selectedPatient: any;
  encounterUUID: string;
  eyeCampVisualAcuityConceptRight: String = '6dde4cac-5db7-4e11-905a-3b17cb5cb08e';
  eyeCampVisualAcuityConceptLeft: String = 'ccb29f96-124c-4380-ab4b-21f8dcf1f2f3';
  eyeCampPinholeAcuityConceptRight: String = '2ca97364-8945-4a64-985b-b3daad7343e3';
  eyeCampPinholeAcuityConceptLeft: String = '9c1682db-3e22-4f71-b7dd-bb080e86df55';
  eyeCampPatientComplaintConceptRight: String = 'ae0a7b44-5bd6-4043-98cd-aa36f5dd8f96';
  eyeCampPatientComplaintConceptLeft: String = '10552bf7-566f-446f-b4a0-3b3cb78b79f0';
  eyeCampDiagnosisConcept: String = '6066c8ac-e3dd-445b-8035-c806423e887a';
  eyeCampDiagnosisConceptLeft: String = '8e0bee1a-37f0-4039-a3a2-903190004264';
  eyeCampReferralConcept: String = '841e348f-abd2-44e9-b29e-eb75b0e08c57';
  eyeCampReferralTimingConcept: String = '5deb5f33-41bc-48df-9e20-55502403089c';
  constructor(
    private visitService: VisitService,
    private encounterService: EncounterService
  ) {}

  ngOnInit(): void {
    this.constructVisuityAcuityAndPinholeAcuity();
    this.constructPatientComplaint();
    this.constructDiagnosis();
    this.getAllVisits();
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
    });
  }

  constructVisuityAcuityAndPinholeAcuity() {
    this.accutiyandpinholeright.push(
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
    this.accutiyandpinholeleft.push(
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
    console.log(data)
    this.selectedPatient = data[0];
    if (this.selectedPatient) {
      this.visitService.fetchVisitDetails(this.selectedPatient.visit_uuid).subscribe(response => {
        console.log(response?.encounters)
        this.encounterUUID = response?.encounters?.filter(en => en.display.match('Visit Note'))[0]?.uuid;
      });
    }
  }

  _filter(value: string) {
    const filterValue = value.toLowerCase();
    this.filterData = this.processVisitData.filter(campid => campid.eye_camp_id?.value?.toLowerCase().includes(filterValue));
  }

  onChangeHandler(type, value) {
    console.log(type, value)
  }

  save(concept, value) {
    const date = new Date();
    if (this.selectedPatient && this.encounterUUID) {
      const json = {
        concept,
        person: this.selectedPatient.patient_uuid,
        obsDatetime: date,
        value,
        encounter: this.encounterUUID
      };
      console.log(json)
      // this.encounterService.postObs(json).subscribe(response => {
      //   console.log(response);
      // });
    }
  }
}
