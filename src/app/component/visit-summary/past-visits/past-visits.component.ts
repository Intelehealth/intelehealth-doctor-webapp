import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { VisitService } from "src/app/services/visit.service";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "app-past-visits",
  templateUrl: "./past-visits.component.html",
  styleUrls: ["./past-visits.component.css"],
})
export class PastVisitsComponent implements OnInit {
  @Output() chiefComplaint = new EventEmitter<string>();
  recentVisit: any = [];
  observation: {};
  visitStatus: String;
  recent: any = [];
  patientUuid: any;
  visits: any;
  form = new FormGroup({
    status: new FormControl("en", [Validators.required]),
  });
  constructor(private route: ActivatedRoute, 
    private service: VisitService, 
    private router: Router,
    private modalService: NgbModal
    ) {}

  ngOnInit() {
   this.patientUuid = this.route.snapshot.paramMap.get("patient_id");
    this.service.recentVisits(this.patientUuid).subscribe((response) => {
      this.visits = response.results;
      this.visits.forEach((visit) => {
        this.service.fetchVisitDetails(visit.uuid).subscribe((visitDetails) => {
          this.recentVisit = [];
          this.recentVisit.details = visitDetails;
          const encounters = visitDetails.encounters;
          encounters.forEach((encounter) => {
            const display = encounter.display;
            if (display.match("ADULTINITIAL") !== null) {
              const obs = encounter.obs;
              let b = " ";
              obs.forEach((res) => {
                if (res.display.match("CURRENT COMPLAINT") !== null) {
                  const currentComplaint = res.display.split("<b>");
                  for (let i = 1; i < currentComplaint.length; i++) {
                    const obs1 = currentComplaint[i].split("<");
                    if (!obs1[0].match("Associated symptoms")) {
                      b = b + " | " + obs1[0];
                      this.recentVisit.observation = b;
                    }
                  }
                }
              });
            }
          });
          if (
            visitDetails.stopDatetime === null ||
            visitDetails.stopDatetime === undefined
          ) {
            this.recentVisit.visitStatus = "Active";
          }
          this.chiefComplaint.emit(this.recentVisit);
          this.recent.push(this.recentVisit);
        });
      });
    });
  }

  print(patientUuid, lang){
    this.router.navigateByUrl(`/prescription/${patientUuid}/${lang}`)
  }

  open(content) {
    let ngbModalOptions: NgbModalOptions = {
      backdrop : 'static',
      keyboard : false
  };
    this.modalService.open(content, ngbModalOptions);
  }

  checkLang(patientUuid) {
    const formValue = this.form.value;
    const value = formValue.status;
    this.modalService.dismissAll();
    this.print(patientUuid, value);
  }

  close() {
    this.form.reset()
    this.modalService.dismissAll();
  }
}
