import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { environment } from 'src/environments/environment';
import { FormGroup, FormControl } from "@angular/forms";
import { VisitService } from 'src/app/services/visit.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reassign-speciality',
  templateUrl: './reassign-speciality.component.html',
  styleUrls: ['./reassign-speciality.component.css']
})
export class ReassignSpecialityComponent implements OnInit {
  type = 'N'
  patientDetails: any;
  visitUuid = this.route.snapshot.paramMap.get("visit_id");
  baseURL = environment.baseURL;
  baseURLProvider = `${this.baseURL}/visit/${this.visitUuid}/attribute`;
  specializations = [
    "General Physician",
    "Dermatologist",
    "Physiotherapist",
    "Gynecologist",
    "Pediatrician",
    "SAM"
  ];

  updateSpeciality = new FormGroup({ 
    specialization: new FormControl(
      ""
      // this.data.specialization ? this.data.specialization.value : null
    )
  });
  constructor(
    private visitService: VisitService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.visitService.getVisit(this.visitUuid).subscribe((visitDetails) => {
         this.patientDetails = visitDetails
         console.log(' this.patientDetails : ',  this.patientDetails );
         this.updateSpeciality.controls.specialization.setValue(this.patientDetails.attributes[0].display)
    })
  }

  Submit() {
    if(confirm("Are you sure to re-assign this visit to another doctor?")) {
      const value = this.updateSpeciality.value;
      if (value.specialization !== null) {
        const URL = this.patientDetails.attributes[0].display
          ? `${this.baseURLProvider}/${this.patientDetails.attributes[0].uuid}`
          : this.baseURLProvider;
        const json = {
          attributeType: "3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d",
          value: value.specialization,
        };
        this.http.post(URL, json).subscribe((response) => {
            this.router.navigate(['/home'])
        })
     
    }
    }
  }
}
