import { Component, OnInit } from '@angular/core';

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
  constructor() { }

  ngOnInit(): void {
    this.constructVisuityAcuityAndPinholeAcuity();
    this.constructPatientComplaint();
    this.constructDiagnosis();
  }

  constructVisuityAcuityAndPinholeAcuity() {
    this.accutiyandpinholeright.push(
      {value: '<6/6', name: 'Right eye: <6/6' },
      {value: '6/6', name: 'Right eye: 6/6'},
      {value: '6/9', name: 'Right eye: 6/9'},
      {value: '6/12', name: 'Right eye: 6/12'},
      {value: '6/18', name: 'Right eye: 6/18'},
      {value: '6/24', name: 'Right eye: 6/24'},
      {value: '6/36', name: 'Right eye: 6/36'},
      {value: '6/60', name: 'Right eye: 6/60'},
      {value: 'Hand movements', name: 'Right eye: Hand movements'},
      {value: 'Light perception only', name: 'Right eye: Light perception only'},
      {value: 'No light perception', name: 'Right eye: No light perception'}
    );
    this.accutiyandpinholeleft.push(
      {value: '<6/6', name: 'Left eye: <6/6' },
      {value: '6/6', name: 'Left eye: 6/6'},
      {value: '6/9', name: 'Left eye: 6/9'},
      {value: '6/12', name: 'Left eye: 6/12'},
      {value: '6/18', name: 'Left eye: 6/18'},
      {value: '6/24', name: 'Left eye: 6/24'},
      {value: '6/36', name: 'Left eye: 6/36'},
      {value: '6/60', name: 'Left eye: 6/60'},
      {value: 'Hand movements', name: 'Left eye: Hand movements'},
      {value: 'Light perception only', name: 'Left eye: Light perception only'},
      {value: 'No light perception', name: 'Left eye: No light perception'}
    );
  }

  constructPatientComplaint() {
    this.patientcomplaintright.push(
      {value: 'Blurry Vision Up Close', name: 'Right eye'},
      {value: 'Blurry Vision Far Away', name: 'Right eye'},
      {value: 'Redness', name: 'Right eye'},
      {value: 'Eye Pain or Irritation', name: 'Right eye'},
      {value: 'Headache', name: 'Right eye'},
      {value: 'Eye Trauma', name: 'Right eye'},
      {value: 'PC IOL', name: 'Right eye'},
      {value: 'Other', name: 'Right eye'},
    );
    this.patientcomplaintleft.push(
      {value: 'Blurry Vision Up Close', name: 'Left eye' },
      {value: 'Blurry Vision Far Away', name: 'Left eye' },
      {value: 'Redness', name: 'Left eye'},
      {value: 'Eye Pain or Irritation', name: 'Left eye'},
      {value: 'Headache', name: 'Left eye'},
      {value: 'Eye Trauma', name: 'Left eye'},
      {value: 'PC IOL', name: 'Left eye'},
      {value: 'Other', name: 'Left eye'},
    );
  }

  constructDiagnosis() {
    this.diagnosisright.push(
      {value: 'Normal Eye Exam', name: 'Right eye'},
      {value: 'Refractive Error/Presbiopia', name: 'Right eye'},
      {value: 'Immature Cataract', name: 'Right eye'},
      {value: 'Mature Cataract', name: 'Right eye'},
      {value: 'Inactive Corneal Opacity', name: 'Right eye'},
      {value: 'Active Corneal Infection', name: 'Right eye'},
      {value: 'Pterygium', name: 'Right eye'},
      {value: 'Other', name: 'Right eye'},
    );
    this.diagnosisleft.push(
      {value: 'Normal Eye Exam', name: 'Left eye' },
      {value: 'Refractive Error/Presbiopia', name: 'Left eye' },
      {value: 'Immature Cataract', name: 'Left eye'},
      {value: 'Mature Cataract', name: 'Left eye'},
      {value: 'Inactive Corneal Opacity', name: 'Left eye'},
      {value: 'Active Corneal Infection', name: 'Left eye'},
      {value: 'Pterygium', name: 'Left eye'},
      {value: 'Other', name: 'Left eye'},
    );
  }
}
