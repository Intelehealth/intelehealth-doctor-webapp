import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import {
  APP_BASE_HREF,
  LocationStrategy,
  HashLocationStrategy,
  CommonModule,
} from "@angular/common";

// Component Import
import { AppComponent } from "./app.component";
import { HomepageComponent } from "./component/homepage/homepage.component";
import { VisitSummaryComponent } from "./component/visit-summary/visit-summary.component";
import { FamilyHistoryComponent } from "./component/visit-summary/family-history/family-history.component";
import { PastMedicalHistoryComponent } from "./component/visit-summary/past-medical-history/past-medical-history.component";
import { PresentingComplaintsComponent } from "./component/visit-summary/presenting-complaints/presenting-complaints.component";
import { OnExaminationComponent } from "./component/visit-summary/on-examination/on-examination.component";
import { PhysicalExaminationComponent } from "./component/visit-summary/physical-examination/physical-examination.component";
import { AdditionalDocumentsComponent } from "./component/visit-summary/additional-documents/additional-documents.component";
import { VitalComponent } from "./component/visit-summary/vital/vital.component";
import { MyAccountComponent } from "./component/my-account/my-account.component";
import { PatientInteractionComponent } from "./component/visit-summary/patient-interaction/patient-interaction.component";
import { AdditionalCommentComponent } from "./component/visit-summary/additional-comment/additional-comment.component";
import { DiagnosisComponent } from "./component/visit-summary/diagnosis/diagnosis.component";
import { PrescribedTestComponent } from "./component/visit-summary/prescribed-test/prescribed-test.component";
import { AdviceComponent } from "./component/visit-summary/advice/advice.component";
import { FollowUpComponent } from "./component/visit-summary/follow-up/follow-up.component";
import { PrescribedMedicationComponent } from "./component/visit-summary/prescribed-medication/prescribed-medication.component";
import { LoginPageComponent } from "./component/login-page/login-page.component";
import { NavbarComponent } from "./component/layout/navbar/navbar.component";
import { ChangePasswordComponent } from "./component/change-password/change-password.component";
import { FooterComponent } from "./component/layout/footer/footer.component";
import { PatientinfoComponent } from "./component/visit-summary/patientinfo/patientinfo.component";
import { PastVisitsComponent } from "./component/visit-summary/past-visits/past-visits.component";
import { FindPatientComponent } from "./component/find-patient/find-patient.component";
import { Page404Component } from "./component/page404/page404.component";
import { EditDetailsComponent } from "./component/my-account/edit-details/edit-details.component";
import { AyuComponent } from "./component/ayu/ayu.component";
import { TablesComponent } from "./component/homepage/tables/tables.component";
import { SignatureComponent } from "./component/my-account/signature/signature.component";
import { CurrentVisitComponent } from "./component/visit-summary/current-visit/current-visit.component";
import { ModalsComponent } from "./component/ayu/modals/modals.component";

// Package Import
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { AuthGuard } from "./auth.guard";
import { DatePipe } from "@angular/common";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgxSpinnerModule } from "ngx-spinner";
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

// Material Design Imports
import { AdminGuard } from "./admin.guard";
import { MatTabsModule } from "@angular/material/tabs";
import { MatChipsModule } from "@angular/material/chips";
import { SocketService } from "./services/socket.service";
import { NgxMaterialTimepickerModule } from "ngx-material-timepicker";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatCardModule } from "@angular/material/card";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatRadioModule } from "@angular/material/radio";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatListModule } from "@angular/material/list";
import { MatSelectModule } from "@angular/material/select";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatExpansionModule } from "@angular/material/expansion";
import { ServiceWorkerModule } from "@angular/service-worker";
import { environment } from "../environments/environment";
import { MainComponent } from "./component/main/main.component";
import { FeedbackComponent } from "./component/visit-summary/feedback/feedback.component";
import { EndedVisitsComponent } from "./component/ended-visits/ended-visits.component";
import { MonitoringComponent } from "./component/monitoring/monitoring.component";
import { VcComponent } from "./component/vc/vc.component";
import { HoverClassDirective } from "./directives/hover-class.directive";
import { ChatComponent } from "./component/chat/chat.component";
import { ChatService } from "./services/chat.service";
import { CalendarComponent } from "./component/calendar/calendar.component";
import { AppointmentComponent } from "./component/appointment/appointment.component";
import { CalendarModule, DateAdapter } from "angular-calendar";
import { adapterFactory } from "angular-calendar/date-adapters/date-fns";
import { ConfirmDialogComponent } from "./component/visit-summary/reassign-speciality/confirm-dialog/confirm-dialog.component";
import { ReassignSpecialityComponent } from "./component/visit-summary/reassign-speciality/reassign-speciality.component";
import { TestChatComponent } from "./component/test-chat/test-chat.component";
import { SendSmsComponent } from './component/send-sms/send-sms.component';
import { CookieModule } from "ngx-cookie";
import { ToastrModule } from "ngx-toastr";
import { VideoCallComponent } from './modal-components/video-call/video-call.component';
import { MomentModule } from "ngx-moment";
import { ErrorInterceptor } from "./core/interceptors/error.interceptor";
import { JwtInterceptor } from "./core/interceptors/jwt.interceptor";


const ROUTES: any[] = [
  { path: "login", component: LoginPageComponent },
  {
    path: "",
    component: MainComponent,
    children: [
      {
        path: "home",
        component: HomepageComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "findPatient",
        component: FindPatientComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "myAccount",
        component: MyAccountComponent,
        canActivate: [AuthGuard],
      },
      { path: "ayu", component: AyuComponent, canActivate: [AuthGuard] },
      {
        path: "modals",
        component: ModalsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "signature",
        component: SignatureComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "editDetails",
        component: EditDetailsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "endVisits",
        component: EndedVisitsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "changePassword",
        component: ChangePasswordComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "monitoring",
        component: MonitoringComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "send-sms",
        component: SendSmsComponent,
        canActivate: [AuthGuard, AdminGuard],
      },
      {
        path: "visitSummary/:patient_id/:visit_id",
        component: VisitSummaryComponent,
        canActivate: [AuthGuard],
      },
      { path: "appointment/schedule", component: AppointmentComponent },
      { path: "appointment/view", component: CalendarComponent },
      {
        path: "appointment",
        redirectTo: "appointment/view",
        pathMatch: "full",
      },
      { path: "test/chat", component: TestChatComponent },
      {
        path: "vc/call",
        component: VcComponent,
      },
      { path: "", redirectTo: "home", pathMatch: "full" },
    ],
  },
  { path: "**", component: Page404Component },
];

@NgModule({
  declarations: [
    AppComponent,
    CalendarComponent,
    AppointmentComponent,
    ConfirmDialogComponent,
    ReassignSpecialityComponent,
    HomepageComponent,
    VisitSummaryComponent,
    FamilyHistoryComponent,
    PastMedicalHistoryComponent,
    PresentingComplaintsComponent,
    OnExaminationComponent,
    PhysicalExaminationComponent,
    AdditionalDocumentsComponent,
    VitalComponent,
    MyAccountComponent,
    PatientInteractionComponent,
    AdditionalCommentComponent,
    DiagnosisComponent,
    PrescribedTestComponent,
    AdviceComponent,
    FollowUpComponent,
    LoginPageComponent,
    PrescribedMedicationComponent,
    NavbarComponent,
    ChangePasswordComponent,
    FooterComponent,
    PatientinfoComponent,
    PastVisitsComponent,
    FindPatientComponent,
    Page404Component,
    SignatureComponent,
    EditDetailsComponent,
    AyuComponent,
    TablesComponent,
    CurrentVisitComponent,
    ModalsComponent,
    MainComponent,
    FeedbackComponent,
    MonitoringComponent,
    EndedVisitsComponent,
    VcComponent,
    HoverClassDirective,
    ChatComponent,
    TestChatComponent,
    SendSmsComponent,
    VideoCallComponent
  ],

  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    MatRadioModule,
    MatIconModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatListModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    NgbModule,
    HttpClientModule,
    NgxSpinnerModule,
    NgMultiSelectDropDownModule,
    MatTabsModule,
    MatChipsModule,
    NgxMaterialTimepickerModule,
    CookieModule.withOptions(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    RouterModule.forRoot(ROUTES, { scrollPositionRestoration: "enabled" }),
    // tslint:disable-next-line: max-line-length
    ServiceWorkerModule.register("/intelehealth/custom-service-worker.js", {
      enabled: environment.production,
      registrationStrategy: "registerImmediately",
    }),
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      closeButton: true,
      tapToDismiss: false
    }),
    MomentModule
  ],
  providers: [
    AuthGuard,
    DatePipe,
    MatDatepickerModule,
    MatNativeDateModule,
    { provide: APP_BASE_HREF, useValue: "/" },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
    SocketService,
    ChatService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
