import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DiagnosisService } from "../services/diagnosis.service";
import { VisitService } from "../services/visit.service";
declare var getFromStorage: any;

@Component({
  selector: "app-patient-interaction-v4",
  templateUrl: "./patient-interaction-v4.component.html",
  styleUrls: ["./patient-interaction-v4.component.scss"],
})
export class PatientInteractionV4Component implements OnInit {
  @Input() iconImg = "assets/svgs/patient-interaction.svg";
  @Input() readOnly = false;
  @Input() showToggle = true;

  isCollapsed = false;
  phoneNo;
  whatsappLink: string;
  selectedValue: string;
  isDataPresent:boolean=false;
  visitId: string;

  constructor(private route: ActivatedRoute,
    private visitService: VisitService, private diagnosisService: DiagnosisService) { }

  ngOnInit(): void {
    const uuid = this.route.snapshot.paramMap.get("patient_id");
    this.visitId = this.route.snapshot.paramMap.get("visit_id");
    this.visitService.patientInfo(uuid).subscribe((info) => {
      info.person["attributes"].forEach((attri) => {
        if (attri.attributeType.display.match("Telephone Number")) {
          this.phoneNo = attri.value;
          this.whatsappLink = this.visitService.getWhatsappLink(this.phoneNo, `Hello I'm calling for consultation`);
        }
      });
      this.getAttributes();
    });
  }

  getAttributes() {
    this.visitService.getAttribute(this.visitId).subscribe((response) => {
      const result = response.results;
      var tempMsg = result.filter((pType) =>
        ["Yes", "No"].includes(pType.value)
      );
      if (tempMsg.length !== 0) {
        this.selectedValue = tempMsg[tempMsg.length-1].value;
        this.isDataPresent = true;
      }
    });
  }

  save() {
    let value = this.selectedValue;
    const providerDetails = getFromStorage("provider");
    const providerUuid = providerDetails.uuid;
    if (this.diagnosisService.isSameDoctor()) {
      this.visitService.getAttribute(this.visitId).subscribe((response) => {
        const result = response.results;
        if (result.length !== 0 && ["Yes", "No"].includes(response.value)) {
        } else {
          const json = {
            attributeType: "6cc0bdfe-ccde-46b4-b5ff-e3ae238272cc",
            value: value,
          };
          this.visitService
            .postAttribute(this.visitId, json)
            .subscribe((response1) => {
              this.selectedValue = value;
              this.isDataPresent = true;
            });
        }
      });
    }
  }
}
