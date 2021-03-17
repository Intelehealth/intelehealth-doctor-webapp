import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { environment } from 'src/environments/environment';
import { FormGroup, FormControl } from "@angular/forms";
import { VisitService } from 'src/app/services/visit.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reassign-speciality',
  templateUrl: './reassign-speciality.component.html',
  styleUrls: ['./reassign-speciality.component.css']
})
export class ReassignSpecialityComponent implements OnInit {
  type = 'N'
  patientDetails: any;
  baseURL = environment.baseURL;
  // baseURLProvider = `${this.baseURL}/provider/${this.data.uuid}/attribute`;
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
  ) { }

  ngOnInit(): void {
    const visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.visitService.getVisit(visitUuid).subscribe((visitDetails) => {
         this.patientDetails = visitDetails
         console.log('this.patientDetails---42: ', this.patientDetails);
         this.updateSpeciality.controls.specialization.setValue(this.patientDetails.attributes[0].display)
    })
  }

  Submit() {
    if(confirm("Are you sure to re-assign this visit to another doctor ")) {
      const value = this.updateSpeciality.value;
      if (value.specialization !== null) {
      //   const URL = this.data.specialization
      //     ? `${this.baseURLProvider}/${this.data.specialization.uuid}`
      //     : this.baseURLProvider;
      //   const json = {
      //     attributeType: "ed1715f5-93e2-404e-b3c9-2a2d9600f062",
      //     value: value.specialization,
      //   };
      //   this.http.post(URL, json).subscribe((response) => {});
      // }
      // this.onClose();
      // setTimeout(() => window.location.reload(), 2000);
    }
    }
  }
}
