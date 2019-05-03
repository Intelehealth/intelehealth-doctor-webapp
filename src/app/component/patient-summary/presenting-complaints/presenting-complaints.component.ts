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
  conceptComplaint = '3edb0e09-9135-481e-b8f0-07a26fa9a5ce';

  constructor(private diagnosisService: DiagnosisService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    const uuid = this.route.snapshot.paramMap.get('patient_id');
    this.diagnosisService.getObs(uuid, this.conceptComplaint)
    .subscribe(response => {
      this.complaint = response.results[0];
    });
 }
}

