import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {jsPDF} from 'jspdf';
import html2canvas from "html2canvas";
import { VisitService } from 'src/app/services/visit.service';

@Component({
  selector: 'app-patient-details',
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.css']
})
export class PatientDetailsComponent implements OnInit {
  visitId: string;
  data = {
    person: { 'name': '', 'age': 0, 'sex': '', 'openMrsId': '' },
    complaints: [],
    familyHistory: [],
    pastMedical: [],
    onExamination: [],
    vitals: []
  }

  constructor(private visitService: VisitService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.visitId = this.route.snapshot.paramMap.get("visit_id");
    this.visitService
      .fetchVisitDetails(this.visitId)
      .subscribe({
        next: (res: any) => {
          if (res) {
            if (res.patient.person) {
              this.data.person.name = res.patient.person.display;
              this.data.person.age = res.patient.person.age;
              this.data.person.sex = res.patient.person.gender;
              this.data.person.openMrsId = res.patient?.identifiers[0]?.identifier
            }
            let encounter = res.encounters.find(enc => enc.display.includes('ADULTINITIAL'));
            const obs = encounter.obs;
            obs.forEach(ob => {
              if(ob.display.includes('CURRENT COMPLAINT')) {
                this.data.complaints = ob.value;
              }
              if(ob.display.includes('FAMILY HISTORY')) {
                this.data.familyHistory = ob.value;
              }
              if(ob.display.includes('MEDICAL HISTORY')) {
                this.data.pastMedical = ob.value;
              }
              if(ob.display.includes('PHYSICAL EXAMINATION')) {
                this.data.onExamination = ob.value;
              }
            })
          }
        }
      });
  }


  print() {
    var tempTitle = document.title;
    document.title = "Patient Details.pdf";
    window.print();
    document.title = tempTitle;
  }

  download() {
    var data = document.getElementById("prescription");
    html2canvas(data).then(canvas => {
      const contentDataURL = canvas.toDataURL("image/png", 1.0);
      let pdf = new jsPDF();
      var width = pdf.internal.pageSize.getWidth();    
          var height = pdf.internal.pageSize.getHeight();
          pdf.addImage(contentDataURL, 'JPEG', 10, 10, width-20, height-10);
      pdf.save("Patient Details.pdf");
    });
  }
}
