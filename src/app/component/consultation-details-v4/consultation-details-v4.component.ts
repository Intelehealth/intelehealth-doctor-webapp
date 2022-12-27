import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { VisitService } from 'src/app/services/visit.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "./../../services/session.service";
import { SocketService } from "src/app/services/socket.service";
import { ChatComponent } from "../chat/chat.component";
declare var getFromStorage: any, saveToStorage: any, deleteFromStorage: any;

@Component({
  selector: "app-consultation-details-v4",
  templateUrl: "./consultation-details-v4.component.html",
  styleUrls: ["./consultation-details-v4.component.scss"],
})
export class ConsultationDetailsV4Component implements OnInit {
  @ViewChild(ChatComponent) chatComponent: ChatComponent;
  @Input() iconImg = "assets/svgs/consultation-details-icon.svg";
  @Input() showToggle = true;
  @Input() readOnly = false;

  visitCreated: any;
  visitID: string;
  visitDetail;
  providerName: string;
  clinicName: string;
  visitStatus: string;
  hwPhoneNo: number;
  specialization;
  isOpenChat: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private visitService: VisitService,
    private sessionService: SessionService,
    private authService: AuthService,
    private socket: SocketService
  ) { }

  ngOnInit() {
    const visitId = this.route.snapshot.params['visit_id'];
    this.visitService.fetchVisitDetails(visitId)
      .subscribe(visitDetailData => {
        this.visitDetail = visitDetailData;
        this.visitCreated = this.visitDetail.startDatetime;
        this.visitID = visitId.replace(/.(?=.{4})/g, 'x');
        this.clinicName = visitDetailData.display.split('@ ')[1].split(' -')[0];
        visitDetailData.encounters.forEach(encounter => {
          if (encounter.display.match('ADULTINITIAL') !== null) {
            this.providerName = encounter.encounterProviders[0].display;
            encounter.encounterProviders[0].provider.attributes.forEach((attribute) => {
              if (attribute.display.match("phoneNumber") != null) {
                this.hwPhoneNo = attribute.value;
              }
            });
          }
        });
        this.visitStatus = this.getVisitStatus(visitDetailData.encounters[0].encounterType.display);
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

  getVisitStatus(status: string) {
    let statusName: string;
    switch (status) {
      case 'Flagged':
        statusName = 'Priority visit'
        break;
      case 'ADULTINITIAL':
      case 'Vitals':
        statusName = 'Awaiting visit'
        break;
      case 'Visit Note':
        statusName = 'In-progress visit'
        break;
      case 'Visit Complete':
        statusName = 'Completed visit'
        break;
    }
    return statusName;
  }

  getChat() {
    this.chatComponent.chatLaunch();
  }
}
