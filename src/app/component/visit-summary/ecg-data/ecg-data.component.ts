import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-ecg-data',
  templateUrl: './ecg-data.component.html',
  styleUrls: ['./ecg-data.component.css']
})
export class EcgDataComponent implements OnInit {
  baseURL = environment.baseURL;
  ecgPresent = false;
  ecgImages: any = [];
  ecgData = {'rInterval': 0 , "hrv": 0, "mood": "-", "heartBeat":0, "stressLevel":"invalid",
   "heartRate": 0, "repositoryRate":0, "heartAge":0,  "robustHeartRate":0 }
  conceptECG_Image = "d336cb54-bd98-4f76-ac7a-591ebc69d6ab";
  conceptECG = "503fcb05-e580-4017-8d94-4777c6740374"
  constructor(private diagnosisService: DiagnosisService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    const patientUuid = this.route.snapshot.paramMap.get('patient_id');
    const visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.getECGImage(patientUuid, visitUuid);
    this.getECGData(patientUuid, visitUuid);
  }


  private getECGImage(patientUuid:string, visitUuid:string) {
    this.diagnosisService.getObs(patientUuid, this.conceptECG_Image)
      .subscribe(response => {
        response.results.forEach(obs => {
          if (obs.encounter !== null && obs.encounter.visit.uuid === visitUuid) {
            this.ecgPresent = true;
            const data = {
              image: `${this.baseURL}/obs/${obs.uuid}/value`
            };
            this.ecgImages.push(data);
          }
        });
      });
  }
  
  private getECGData(patientUuid:string, visitUuid:string) {
    this.diagnosisService.getObs(patientUuid, this.conceptECG)
      .subscribe(response => {
        response.results.forEach(obs => {
          if (obs.encounter !== null && obs.encounter.visit.uuid === visitUuid) {
            this.ecgPresent = true;
            if (obs?.value.toString().startsWith("{")) {
              let value = JSON.parse(obs.value.toString());
              this.ecgData.rInterval = value?.r_r_interval;
              this.ecgData.hrv = value?.hrv;
              this.ecgData.mood = value?.mood;
              this.ecgData.heartBeat = value?.heart_beat;
              this.ecgData.stressLevel = value?.stress_level;
              this.ecgData.heartRate = value?.heart_rate;
              this.ecgData.repositoryRate = value?.respiratory_rate;
              this.ecgData.heartAge = value?.heart_age;
              this.ecgData.robustHeartRate = value?.robust_heart_rate;
            }
          }
        });
      });
  }
}
