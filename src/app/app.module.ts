import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule, APP_BASE_HREF, LocationStrategy, HashLocationStrategy } from '@angular/common';

import { AppComponent } from './app.component';
import { HomepageComponent } from './component/homepage/homepage.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatDialogModule,
  MatGridListModule,
  MatCardModule,
  MatSnackBarModule,
  MatInputModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatButtonModule,
  MatIconModule,
  MatRadioModule,
  MatTooltipModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatListModule,
  MatSelectModule,
  MatAutocompleteModule,
  MatProgressSpinnerModule} from '@angular/material/';
import { PatientSummaryComponent } from './component/patient-summary/patient-summary.component';
import { FamilyHistoryComponent } from './component/patient-summary/family-history/family-history.component';
import { PastMedicalHistoryComponent } from './component/patient-summary/past-medical-history/past-medical-history.component';
import { PresentingComplaintsComponent } from './component/patient-summary/presenting-complaints/presenting-complaints.component';
import { OnExaminationComponent } from './component/patient-summary/on-examination/on-examination.component';
import { PhysicalExaminationComponent } from './component/patient-summary/physical-examination/physical-examination.component';
import { AdditionalDocumentsComponent } from './component/patient-summary/additional-documents/additional-documents.component';
import { VitalComponent } from './component/patient-summary/vital/vital.component';
import { MyAccountComponent } from './component/my-account/my-account.component';
import { PatientInteractionComponent } from './component/patient-summary/patient-interaction/patient-interaction.component';
import { AdditionalCommentComponent } from './component/patient-summary/additional-comment/additional-comment.component';
import { DiagnosisComponent } from './component/patient-summary/diagnosis/diagnosis.component';
import { PrescribedTestComponent } from './component/patient-summary/prescribed-test/prescribed-test.component';
import { AdviceComponent } from './component/patient-summary/advice/advice.component';
import { FollowUpComponent } from './component/patient-summary/follow-up/follow-up.component';
import { PrescribedMedicationComponent } from './component/patient-summary/prescribed-medication/prescribed-medication.component';
import { LoginPageComponent } from './component/login-page/login-page.component';

import { CookieService } from 'ngx-cookie-service';
import { AuthGuard } from './auth.guard';
import { NavbarComponent } from './component/layout/navbar/navbar.component';
import { ChangePasswordComponent } from './component/change-password/change-password.component';
import { FooterComponent } from './component/layout/footer/footer.component';
import { PatientinfoComponent } from './component/patient-summary/patientinfo/patientinfo.component';
import { PastVisitsComponent } from './component/patient-summary/past-visits/past-visits.component';
import { DatePipe } from '@angular/common';
import { FindPatientComponent } from './component/find-patient/find-patient.component';
import { Page404Component } from './component/page404/page404.component';
import { SignatureComponent } from './component/my-account/signature/signature.component';
import { UserIdleModule } from 'angular-user-idle';
import { EditDetailsComponent } from './component/my-account/edit-details/edit-details.component';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    PatientSummaryComponent,
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
    EditDetailsComponent
  ],
  imports: [
    BrowserModule,
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
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    UserIdleModule.forRoot({idle: 900, timeout: 30, ping: 12}),
    RouterModule.forRoot([
      { path: '', component: LoginPageComponent },
      { path: 'home', component: HomepageComponent, canActivate: [AuthGuard] },
      { path: 'findPatient', component: FindPatientComponent, canActivate: [AuthGuard] },
      { path: 'myAccount', component: MyAccountComponent, canActivate: [AuthGuard] },
      { path: 'signature', component: SignatureComponent, canActivate: [AuthGuard] },
      { path: 'editDetails', component: EditDetailsComponent, canActivate: [AuthGuard] },
      { path: 'changePassword', component: ChangePasswordComponent, canActivate: [AuthGuard] },
      { path: 'patientSummary/:patient_id/:visit_id', component: PatientSummaryComponent, canActivate: [AuthGuard] },
      { path: '**', component: Page404Component }
    ], {scrollPositionRestoration: 'enabled'}),
  ],
  providers: [
    CookieService,
    AuthGuard,
    DatePipe,
    { provide: APP_BASE_HREF, useValue: '/' },
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
