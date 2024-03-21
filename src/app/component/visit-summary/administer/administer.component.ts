import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from '../../../services/diagnosis.service';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import { environment } from 'src/environments/environment';
import { VisitService } from 'src/app/services/visit.service';
import { CoreService } from 'src/app/services/core/core.service';


@Component({
  selector: 'app-administer',
  templateUrl: './administer.component.html',
  styleUrls: ['./administer.component.css'],
  animations: [
    trigger('moveInLeft', [
      transition('void=> *', [style({ transform: 'translateX(300px)' }),
      animate(200, keyframes([
        style({ transform: 'translateX(300px)' }),
        style({ transform: 'translateX(0)' })
      ]))]),
      transition('*=>void', [style({ transform: 'translateX(0px)' }),
      animate(100, keyframes([
        style({ transform: 'translateX(0px)' }),
        style({ transform: 'translateX(300px)' })
      ]))])
    ])
  ]
})
export class AdministerComponent implements OnInit {

  administerMedAid: any = [];
  medicines = [];
  aids: any = [];
  eyeImages: any = [];
  patientId: string;
  visitUuid: string;
  baseURL = environment.baseURL;

  constructor(
    private route: ActivatedRoute,
    private visitService: VisitService,
    private diagnosisService: DiagnosisService,
    private coreService: CoreService,
  ) { }

  ngOnInit(): void {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.getDispense(this.visitUuid);
  }

  getDispense(visitID:any){
    this.visitService.fetchVisitDetails(visitID)
    .subscribe(visitDetail => {
      visitDetail.encounters.filter((e) => {
        if(e.display.includes("ADMINISTER")){
          let dispenseObs = {};
          let imageDoc = [];
          for(let i = 0; i < e.obs.length; i++){
            if(e.obs[i].display.includes("ADMINISTER_MEDICATION")){
              let obsData = JSON.parse(e.obs[i].value)
              dispenseObs['medicationUuidList'] = obsData.medicationUuidList
              dispenseObs['medicationNotesList'] = obsData.medicationNotesList
              dispenseObs['medDocumentsList'] = obsData.documentsList
              dispenseObs['obsDatetime'] = e.obs[i].obsDatetime
              dispenseObs['creator'] = e.obs[i].creator
            }
            if(e.obs[i].display.includes("ADMINISTER_AID")){
              let obsData = JSON.parse(e.obs[i].value)              
              dispenseObs['aidUuidList'] = obsData.aidUuidList
              dispenseObs['aidNotesList'] = obsData.aidNotesList
              dispenseObs['aidDocumentsList'] = obsData.documentsList
              dispenseObs['obsDatetime'] = e.obs[i].obsDatetime
              dispenseObs['creator'] = e.obs[i].creator
              dispenseObs['otherAids'] = obsData.otherAids
              dispenseObs['outOfPocket'] = obsData.outOfPocket
              dispenseObs['totalCost'] = obsData.totalCost
              dispenseObs['vendorDiscount'] = obsData.vendorDiscount
              dispenseObs['coveredCost'] = obsData.coveredCost
            }
            if(e.obs[i].display.includes("Complex Image")){
              const data = { 
                src: `${this.baseURL}/obs/${e.obs[i].uuid}/value`,
                imgId: e.obs[i].uuid.split("_")[0]
              }
              this.eyeImages.push(data);
              imageDoc.push(data);
              dispenseObs['docImage'] = imageDoc
              dispenseObs['obsDatetime'] = e.obs[i].obsDatetime
              dispenseObs['creator'] = e.obs[i].creator
            }           
          }
          this.administerMedAid.push(dispenseObs);
        }
        if(e.display.includes("Visit Note")){
          for(let j = 0; j < e.obs.length; j++){
            let obsMeds = {}
            let obsAids = {}
            if(e.obs[j].display.includes("JSV MEDICATIONS")){
              this.diagnosisService.getData(e.obs[j]);
              obsMeds['uuid'] = e.obs[j].uuid
              obsMeds['value'] = e.obs[j].value
              this.medicines.push(obsMeds);
            }
            if(e.obs[j].display.includes("Type 1") || e.obs[j].display.includes("Type 2") || e.obs[j].display.includes("Type 3") || e.obs[j].display.includes("Type 4") || e.obs[j].display.includes("Type 5")){
              this.diagnosisService.getData(e.obs[j]);
              obsAids['display'] = e.obs[j].display
              obsAids['uuid'] = e.obs[j].uuid
              obsAids['value'] = e.obs[j].value
              this.aids.push(obsAids);
            }
          }
        }
      });
    });
  }

  get txtDirection() {
    return localStorage.getItem("selectedLanguage") === 'ar' ? "rtl" : "ltr";
  }

  getLang() {
    return localStorage.getItem("selectedLanguage");
   }

  previewEyeImages(index: number, imgs: any) {
    this.coreService.openImagesPreviewModal({ startIndex: index, source: imgs }).subscribe((res: any) => { });
  }
}
