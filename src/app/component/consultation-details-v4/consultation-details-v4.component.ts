import { animate, state, style, transition, trigger } from "@angular/animations";
import { Component, Input, OnInit } from "@angular/core";
import { VisitService } from 'src/app/services/visit.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "./../../services/session.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SocketService } from "src/app/services/socket.service";
import { HelperService } from "src/app/services/helper.service";
declare var getFromStorage: any, saveToStorage: any, deleteFromStorage: any;

@Component({
  selector: "app-consultation-details-v4",
  templateUrl: "./consultation-details-v4.component.html",
  styleUrls: ["./consultation-details-v4.component.scss"],
})
export class ConsultationDetailsV4Component implements OnInit {
  @Input() iconImg = "assets/svgs/consultation-details-icon.svg";
  @Input() showToggle = true;
  @Input() readOnly = false;

  visitCreated: any;
  visitID:string;
  visitDetail;
  providerName: string;
  clinicName: string;
  specialization;
  constructor(
    private route: ActivatedRoute,
    private visitService: VisitService,
    private sessionService: SessionService,
    private authService: AuthService,
    private service: VisitService,
    private snackbar: MatSnackBar,
    private socket: SocketService,
    private helper: HelperService,
    ) { }
  
    ngOnInit() {
      const visitId = this.route.snapshot.params['visit_id'];
      this.visitService.fetchVisitDetails(visitId)
      .subscribe(visitDetailData => {
        this.visitDetail = visitDetailData;
        this.visitCreated = this.visitDetail.startDatetime
        this.visitID = visitDetailData.patient.identifiers[0].identifier
        this.clinicName = visitDetailData.display.split('@ ')[1].split(' -')[0];
        visitDetailData.encounters.forEach(encounter => {
          if (encounter.display.match('ADULTINITIAL') !== null) {
            this.providerName = encounter.encounterProviders[0].display;
          }
        });
      });
    }

    ngOnInits() {
      if (getFromStorage("visitNoteProvider")) {
        deleteFromStorage("visitNoteProvider");
      }
      const userDetails = getFromStorage("user");
      if (userDetails) {
        this.sessionService.provider(userDetails.uuid).subscribe((provider) => {
          saveToStorage("provider", provider.results[0]);
          const attributes = provider.results[0].attributes;
          attributes.forEach((element) => {
            if (
              element.attributeType.uuid ===
                "ed1715f5-93e2-404e-b3c9-2a2d9600f062" &&
              !element.voided
            ) {
              this.specialization = element.value;
            }
          });
        });
      } else {
        this.authService.logout();
      }
      this.socket.initSocket(true);
      this.socket.onEvent("updateMessage").subscribe((data) => {
        this.socket.showNotification({
          title: "New chat message",
          body: data.message,
          timestamp: new Date(data.createdAt).getTime(),
        });
      });
    }
}
