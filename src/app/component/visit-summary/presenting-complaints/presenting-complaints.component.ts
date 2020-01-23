import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';

@Component({
  selector: 'app-presenting-complaints',
  templateUrl: './presenting-complaints.component.html',
  styleUrls: ['./presenting-complaints.component.css']
})
export class PresentingComplaintsComponent implements OnInit {
  complaint: any = [];
  complaintPresent = false;
  conceptComplaint = '3edb0e09-9135-481e-b8f0-07a26fa9a5ce';

  constructor(private diagnosisService: DiagnosisService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    const patientUuid = this.route.snapshot.paramMap.get('patient_id');
    const visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.diagnosisService.getObs(patientUuid, this.conceptComplaint)
    .subscribe(response => {
      response.results.forEach(obs => {
        if (obs.encounter.visit.uuid === visitUuid) {
          this.complaint.push(obs);
        }
      });
      if (this.complaint !== undefined) {
        this.complaintPresent = true;
      }
    });
 }
}

