import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import {
  CommonModule,
  APP_BASE_HREF,
  LocationStrategy,
  HashLocationStrategy,
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
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CookieService } from "ngx-cookie-service";
import { AuthGuard } from "./auth.guard";
import { DatePipe } from "@angular/common";
import { UserIdleModule } from "angular-user-idle";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgxSpinnerModule } from "ngx-spinner";
import { CalendarModule, DateAdapter } from "angular-calendar";
import { adapterFactory } from "angular-calendar/date-adapters/date-fns";

// Material Design Imports
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
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
import { MatChipsModule } from "@angular/material/chips";
import { ServiceWorkerModule } from "@angular/service-worker";
import { environment } from "../environments/environment";
import { MainComponent } from "./component/main/main.component";
import { VcComponent } from "./component/vc/vc.component";
import { SocketService } from "./services/socket.service";
import { HoverClassDirective } from "./directives/hover-class.directive";
import { ChatComponent } from "./component/chat/chat.component";
import { TestChatComponent } from "./component/test-chat/test-chat.component";
import { ReassignSpecialityComponent } from "./component/visit-summary/reassign-speciality/reassign-speciality.component";
import { ConfirmDialogComponent } from "./component/visit-summary/reassign-speciality/confirm-dialog/confirm-dialog.component";
import { AppointmentScheduleComponent } from "./component/appointment-schedule/appointment-schedule.component";
import { AppointmentViewComponent } from "./component/appointment-view/appointment-view.component";
import { ForgotPasswordComponent } from "./component/forgot-password/forgot-password.component";
import { MatTabsModule } from "@angular/material/tabs";
import { Ng2TelInputModule } from "ng2-tel-input";
import { ForgotUsernameComponent } from "./component/forgot-username/forgot-username.component";
import { LoginContainerComponent } from "./component/login-container/login-container.component";
import { LoginVerificationComponent } from "./component/login-verification/login-verification.component";
import { OtpVerificationComponent } from "./component/otp-verification/otp-verification.component";
import { NgxCaptchaModule } from "ngx-captcha";
import { LoginImageContainerComponent } from "./component/login-image-container/login-image-container.component";
import { LoginFirstImageComponent } from "./component/login-first-image/login-first-image.component";
import { ModaldialogComponent } from "./component/modaldialog/modaldialog.component";
import { ModalinternetconnectionComponent } from "./component/modalinternetconnection/modalinternetconnection.component";
import { InternetconnectionInterceptor } from "./interceptors/internetconnection.interceptor";
//Firebase services
import { AngularFireModule } from "@angular/fire";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { DashboardComponent } from "./component/dashboard/dashboard.component";
import { MatMenuModule } from "@angular/material/menu";
import { DashboardPageComponent } from "./component/dashboard-page/dashboard-page.component";
import { SidenavComponent } from "./component/dashboard-page/sidenav/sidenav.component";

import { NgOtpInputModule } from "ng-otp-input";
import { OtpService } from "./services/otp.service";
import { CalendarContainerComponent } from "./component/calendar-container/calendar-container.component";
import { SetUpCalendarComponent } from "./component/calendar-container/set-up-calendar/set-up-calendar.component";
import { ViewCalendarComponent } from "./component/calendar-container/view-calendar/view-calendar.component";

import { SetNewPasswordComponent } from "./component/set-new-password/set-new-password.component";
import { PasswordStrengthComponent } from "./component/set-new-password/password-strength/password-strength.component";
import { NgSelectModule } from "@ng-select/ng-select";
import { CountryData } from "./component/country-data/country-data";
import { FooterTermsConditionComponent } from "./component/footer-terms-condition/footer-terms-condition.component";
import { SetUpProfileComponent } from "./component/set-up-profile/set-up-profile.component";
import { DashboardSummaryPageComponent } from "./component/dashboard-summary-page/dashboard-summary-page.component";
import { DashboardTableComponent } from "./component/dashboard-table/dashboard-table.component";
import { HelpContainerComponent } from "./component/help-container/help-container.component";
import { HeaderComponent } from "./component/header/header.component";

import { VisitSummaryV4Component } from "./component/visit-summary-v4/visit-summary-v4.component";
import { TabsV4Component } from "./component/tabs-v4/tabs-v4.component";
import { ConsultationDetailsV4Component } from "./component/consultation-details-v4/consultation-details-v4.component";
import { VitalsV4Component } from "./component/vitals-v4/vitals-v4.component";
import { CheckUpReasonV4Component } from "./component/check-up-reason-v4/check-up-reason-v4.component";
import { PatientDetailsComponent } from "./component/patient-details/patient-details.component";
import { PhysicalExaminationV4Component } from "./physical-examination-v4/physical-examination-v4.component";
import { MedicalHistoryV4Component } from "./medical-history-v4/medical-history-v4.component";
import { AdditionalDocumentsV4Component } from "./additional-documents-v4/additional-documents-v4.component";
import { ReferToSpecialistV4Component } from "./refer-to-specialist-v4/refer-to-specialist-v4.component";
import { NotesV4Component } from "./notes-v4/notes-v4.component";
import { MessageContainerComponent } from "./component/message-container/message-container.component";
import { SidebarComponent } from "./component/message-container/sidebar/sidebar.component";
import { ChatContainerComponent } from "./component/message-container/chat-container/chat-container.component";
import { VisitNotesV4Component } from "./visit-notes-v4/visit-notes-v4.component";
import { PatientInteractionV4Component } from "./patient-interaction-v4/patient-interaction-v4.component";
import { DiagnosisV4Component } from './diagnosis-v4/diagnosis-v4.component';
import { InteractionNoteV4Component } from './interaction-note-v4/interaction-note-v4.component';
import { MedicationV4Component } from './medication-v4/medication-v4.component';
import { AdviceV4Component } from './advice-v4/advice-v4.component';
import { TestComponent } from './test/test.component';
import { ReferalV4Component } from './referal-v4/referal-v4.component';
import { FollowUpV4Component } from './follow-up-v4/follow-up-v4.component';
import { CommonModalComponent } from './modals/common-modal/common-modal.component';
import { SetupCalendarV4Component } from './setup-calendar-v4/setup-calendar-v4.component';

@NgModule({
  declarations: [
    AppComponent,
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
    VcComponent,
    HoverClassDirective,
    ChatComponent,
    TestChatComponent,
    ReassignSpecialityComponent,
    ConfirmDialogComponent,
    AppointmentViewComponent,
    AppointmentScheduleComponent,
    LoginContainerComponent,
    LoginVerificationComponent,
    OtpVerificationComponent,
    LoginImageContainerComponent,
    LoginFirstImageComponent,
    ModaldialogComponent,
    ModalinternetconnectionComponent,
    DashboardComponent,
    DashboardPageComponent,
    SidenavComponent,
    CalendarContainerComponent,
    SetUpCalendarComponent,
    ViewCalendarComponent,
    ForgotPasswordComponent,
    ForgotUsernameComponent,
    SetNewPasswordComponent,
    PasswordStrengthComponent,
    FooterTermsConditionComponent,
    SetUpProfileComponent,
    DashboardSummaryPageComponent,
    DashboardTableComponent,
    HelpContainerComponent,
    HeaderComponent,
    VisitSummaryV4Component,
    TabsV4Component,
    VitalsV4Component,
    ConsultationDetailsV4Component,
    CheckUpReasonV4Component,
    PatientDetailsComponent,
    PhysicalExaminationV4Component,
    MedicalHistoryV4Component,
    AdditionalDocumentsV4Component,
    ReferToSpecialistV4Component,
    NotesV4Component,
    MessageContainerComponent,
    SidebarComponent,
    ChatContainerComponent,
    VisitNotesV4Component,
    PatientInteractionV4Component,
    DiagnosisV4Component,
    InteractionNoteV4Component,
    MedicationV4Component,
    AdviceV4Component,
    TestComponent,
    ReferalV4Component,
    FollowUpV4Component,
    CommonModalComponent,
    SetupCalendarV4Component,
  ],

  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    NgxCaptchaModule,
    MatTabsModule,
    Ng2TelInputModule,
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
    MatChipsModule,
    NgbModule,
    HttpClientModule,
    NgxSpinnerModule,
    NgOtpInputModule,
    MatMenuModule,
    NgSelectModule,
    UserIdleModule.forRoot({ idle: 900, timeout: 30, ping: 12 }),
    RouterModule.forRoot(
      [
        {
          path: "login",
          component: LoginContainerComponent,
          children: [
            { path: "", component: LoginPageComponent },
            { path: "forget-username", component: ForgotUsernameComponent },
            { path: "forgot-password", component: ForgotPasswordComponent },
            {
              path: "login-verification",
              component: LoginVerificationComponent,
            },
            { path: "otp-verification", component: OtpVerificationComponent },
          ],
        },
        {
          path: "dashboard",
          component: DashboardComponent,
          children: [
            {
              path: "",
              component: DashboardPageComponent,
              canActivate: [AuthGuard],
            },
            {
              path: "calendar",
              component: CalendarContainerComponent,
              canActivate: [AuthGuard],
            },
            {
              path: "help",
              component: HelpContainerComponent,
              canActivate: [AuthGuard],
            },
            {
              path: "message",
              component: MessageContainerComponent,
              canActivate: [AuthGuard],
            },

            {
              path: "visit-summary",
              component: VisitSummaryV4Component,
              canActivate: [AuthGuard],
            },
          ],
        },
        { path: "set-new/password", component: SetNewPasswordComponent },
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
              path: "changePassword",
              component: ChangePasswordComponent,
              canActivate: [AuthGuard],
            },
            {
              path: "visitSummary/:patient_id/:visit_id",
              component: VisitSummaryComponent,
              canActivate: [AuthGuard],
            },
            { path: "vc/call", component: VcComponent },
            { path: "test/chat", component: TestChatComponent },
            {
              path: "appointment/schedule",
              component: AppointmentScheduleComponent,
            },
            { path: "appointment/view", component: AppointmentViewComponent },
            { path: "", redirectTo: "home", pathMatch: "full" },
          ],
        },
        { path: "**", component: Page404Component },
      ],
      { scrollPositionRestoration: "enabled", relativeLinkResolution: "legacy" }
    ),
    // tslint:disable-next-line: max-line-length
    ServiceWorkerModule.register("/intelehealth/ngsw-worker.js", {
      enabled: environment.production,
      registrationStrategy: "registerImmediately",
    }),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
  ],
  providers: [
    OtpService,
    CookieService,
    AuthGuard,
    DatePipe,
    MatDatepickerModule,
    MatNativeDateModule,
    SocketService,
    CountryData,
    { provide: APP_BASE_HREF, useValue: "/" },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InternetconnectionInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
