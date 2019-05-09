import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// import { CommonModule, APP_BASE_HREF, LocationStrategy, HashLocationStrategy} from '@angular/common';

import { AppComponent } from './app.component';
import { HomepageComponent } from './component/homepage/homepage.component';
import { ActiveVisitComponent } from './component/active-visit/active-visit.component';
import { PatientDashboardComponent } from './component/active-visit/patient-dashboard/patient-dashboard.component';
import { ProfileImageComponent } from './component/active-visit/patient-dashboard/profile-image/profile-image.component';
import { RecentVisitsComponent } from './component/active-visit/patient-dashboard/recent-visits/recent-visits.component';
import { VitalsComponent } from './component/active-visit/patient-dashboard/vitals/vitals.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {NgxPaginationModule} from 'ngx-pagination';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
        MatGridListModule,
        MatCardModule,
        MatSnackBarModule,
        MatInputModule } from '@angular/material/';
import { PatientSummaryComponent } from './component/patient-summary/patient-summary.component';
import { FamilyHistoryComponent } from './component/patient-summary/family-history/family-history.component';
import { PastMedicalHistoryComponent } from './component/patient-summary/past-medical-history/past-medical-history.component';
import { PresentingComplaintsComponent } from './component/patient-summary/presenting-complaints/presenting-complaints.component';
import { OnExaminationComponent } from './component/patient-summary/on-examination/on-examination.component';
import { PhysicalExaminationComponent } from './component/patient-summary/physical-examination/physical-examination.component';
import { AdditionalDocumentsComponent } from './component/patient-summary/additional-documents/additional-documents.component';
import { VitalComponent } from './component/patient-summary/vital/vital.component';
import { FindPatientComponent } from './component/find-patient/find-patient.component';
import { MyAccountComponent } from './component/my-account/my-account.component';
import { PatientInteractionComponent } from './component/patient-summary/patient-interaction/patient-interaction.component';
import { AdditionalCommentComponent } from './component/patient-summary/additional-comment/additional-comment.component';
import { DiagnosisComponent } from './component/patient-summary/diagnosis/diagnosis.component';
import { PrescribedTestComponent } from './component/patient-summary/prescribed-test/prescribed-test.component';
import { AdviceComponent } from './component/patient-summary/advice/advice.component';
import { FollowUpComponent } from './component/patient-summary/follow-up/follow-up.component';
import { PrescribedMedicationComponent } from './component/patient-summary/prescribed-medication/prescribed-medication.component';
import { PageNotFoundComponent } from './page-not-found.component';
import { LoginPageComponent } from './component/login-page/login-page.component';

import { CookieService } from 'ngx-cookie-service';
import { AuthGuard } from './auth.guard';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    ActiveVisitComponent,
    PatientDashboardComponent,
    ProfileImageComponent,
    RecentVisitsComponent,
    VitalsComponent,
    PatientSummaryComponent,
    FamilyHistoryComponent,
    PastMedicalHistoryComponent,
    PresentingComplaintsComponent,
    OnExaminationComponent,
    PhysicalExaminationComponent,
    AdditionalDocumentsComponent,
    VitalComponent,
    FindPatientComponent,
    MyAccountComponent,
    PatientInteractionComponent,
    AdditionalCommentComponent,
    DiagnosisComponent,
    PrescribedTestComponent,
    AdviceComponent,
    FollowUpComponent,
    LoginPageComponent,
    PrescribedMedicationComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatGridListModule,
    MatCardModule,
    MatSnackBarModule,
    MatInputModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    RouterModule.forRoot([
      {path: '', component: LoginPageComponent},
      {path: 'home', component: HomepageComponent, canActivate: [AuthGuard]},
      {path: 'findPatient', component: FindPatientComponent, canActivate: [AuthGuard]},
      {path: 'myAccount', component: MyAccountComponent, canActivate: [AuthGuard]},
      {path: 'activeVisit', component: ActiveVisitComponent, canActivate: [AuthGuard]},
      {path: 'patientDashboard/:id', component: PatientDashboardComponent, canActivate: [AuthGuard]},
      {path: 'patientSummary/:patient_id/:visit_id', component: PatientSummaryComponent, canActivate: [AuthGuard]},
      {path: '**', component: PageNotFoundComponent}
  ])
 ],
  providers: [
    CookieService,
    AuthGuard,
    // { provide: APP_BASE_HREF, useValue: '/' },
    // { provide: LocationStrategy, useClass: HashLocationStrategy }
],
  bootstrap: [AppComponent]
})
export class AppModule { }
