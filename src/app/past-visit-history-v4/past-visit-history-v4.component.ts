import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { VisitSummaryAndPrescriptionModalComponent } from "../modals/visit-summary-and-prescription-modal/visit-summary-and-prescription-modal.component";
import { VisitService } from "../services/visit.service";

@Component({
  selector: "app-past-visit-history-v4",
  templateUrl: "./past-visit-history-v4.component.html",
  styleUrls: ["./past-visit-history-v4.component.scss"],
})
export class PastVisitHistoryV4Component implements OnInit {
  @ViewChild("VisitSummaryModal")
  VisitSummaryModal: VisitSummaryAndPrescriptionModalComponent;

  itemHover: any = null;
  pastVisitHistory: any = {
    headers: [
      {
        name: "",
        type: "stepper",
        imageKey: "stepper",
      },
      {
        name: "Created on",
        type: "string",
        key: "createdOn",
      },
      {
        name: "Consulted by",
        type: "stringwithimage",
        key: "drName",
        imageKey: "profile",
        headerClass: "font-size-md font-bold",
      },
      { name: "Cheif complaint", type: "string", key: "complaint" },
      {
        name: "Summary",
        type: "button",
        headerClass: "text-center",
        imageKey: "summary",
        buttons: [
          {
            label: "View",
            onClick: () => {
              this.VisitSummaryModal.openVisitSummaryModal();
            },
            btnClass: "pill-btn pill-blue-view-btn ",
          },
        ],
      },
      {
        name: "Prescription",
        type: "button",
        headerClass: "text-center ",
        imageKey: "PrescriptionIcon",
        buttons: [
          {
            label: "View",
            onClick: () => {
              this.VisitSummaryModal.openVisitSummaryModal(false);
            },
            btnClass: "pill-btn pill-green-view-btn ",
          },
        ],
      },
      {
        name: "Prescription sent",
        type: "pill",
        headerClass: "text-center",
        imageKey: "PrescriptionSentIcon",
        pill: [
          {
            label: "16 hr ago",
            btnClass: "pill-btn",
          },
        ],
      },
    ],
    data: [],
  };
  isPastVisitsPresent:boolean = false;

  constructor(public modalSvc: NgbModal,
    private route: ActivatedRoute,
    private service: VisitService,
    private datepipe: DatePipe) { }

  ngOnInit(): void {
    const patientUuid = this.route.snapshot.paramMap.get('patient_id');
    const visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.service.recentVisits(patientUuid)
      .subscribe(response => {
        const visits = response.results;
        if (visits.length > 1) {
          this.isPastVisitsPresent = true;
          visits.forEach(visit => {
            if (visit.uuid !== visitUuid)
              this.service.fetchVisitDetails(visit.uuid)
                .subscribe(visitDetails => {
                  let recentVisit: any = { };
                  recentVisit.createdOn = this.datepipe.transform(new Date(visitDetails.startDatetime), 'dd MMM, yyyy');
                  const encounters = visitDetails.encounters;
                  encounters.forEach(encounter => {
                    const display = encounter.display;
                    if (display.match('ADULTINITIAL') !== null) {
                      const obs = encounter.obs;
                      obs.forEach(res => {
                        if (res.display.match('CURRENT COMPLAINT') !== null) {
                          const currentComplaint = res.display.split('<b>');
                          for (let i = 1; i < currentComplaint.length; i++) {
                            const obs1 = currentComplaint[i].split('<');
                            if (!obs1[0].match('Associated symptoms')) {
                              recentVisit.complaint = obs1[0];
                            }
                          }
                        }
                      });
                    }
                    if (display.match("Visit Complete") !== null) {
                      recentVisit.drName = encounter.encounterProviders[0].display;
                      recentVisit["label"] = this.getPrescriptionsentTime(encounter.encounterDatetime);
                      console.log("recentVisit",recentVisit)
                      recentVisit = this.getObj(recentVisit);
                      this.pastVisitHistory.data.push(recentVisit)
                    }
                  });
                });
          });
        }
      });
  }

  getPrescriptionsentTime(date) {
    const start = new Date().getTime();
    const end = new Date(date).getTime();
    let time = start - end;  
    let diffDays = Math.floor(time /  86400000)
    var diff =(new Date().getTime() - new Date(date).getTime()) / 1000;
      diff /= (60 * 60);
     let diffHours =  Math.abs(Math.round(diff));
    if(diffHours < 24){
      return  diffHours + " hr ago";
    } else {
      return this.datepipe.transform(new Date(date), 'dd MMM, yyyy');
    }
  }

  getObj(recentVisit) {
    let visit = recentVisit;
    visit.profile = "assets/svgs/table-profile.svg";
    visit.summary = "assets/svgs/summary-list-blue-icon.svg";
    visit.PrescriptionSentIcon = "assets/svgs/Prescription-sent-icon.svg";
    visit.PrescriptionIcon = "assets/svgs/Prescription-green-Icon.svg";
    visit.stepper = "assets/svgs/green-color-steper.svg";
    return visit;
  }
}
