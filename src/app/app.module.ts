import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule, APP_BASE_HREF, LocationStrategy, HashLocationStrategy} from '@angular/common';

import { AppComponent } from './app.component';
import { HomepageComponent } from './component/homepage/homepage.component';
import { ActiveVisitComponent } from './component/active-visit/active-visit.component';
import { PatientDashboardComponent } from './component/active-visit/patient-dashboard/patient-dashboard.component';
import { ProfileImageComponent } from './component/active-visit/patient-dashboard/profile-image/profile-image.component';
import { RecentVisitsComponent } from './component/active-visit/patient-dashboard/recent-visits/recent-visits.component';
import { VitalsComponent } from './component/active-visit/patient-dashboard/vitals/vitals.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
        MatGridListModule,
        MatCardModule } from '@angular/material/';
import { PatientSummaryComponent } from './component/patient-summary/patient-summary.component';
import { FamilyHistoryComponent } from './component/patient-summary/family-history/family-history.component';
import { PastMedicalHistoryComponent } from './component/patient-summary/past-medical-history/past-medical-history.component';
import { PresentingComplaintsComponent } from './component/patient-summary/presenting-complaints/presenting-complaints.component';
import { OnExaminationComponent } from './component/patient-summary/on-examination/on-examination.component';
import { PhysicalExaminationComponent } from './component/patient-summary/physical-examination/physical-examination.component';
import { AdditionalDocumentsComponent } from './component/patient-summary/additional-documents/additional-documents.component';
import { VitalComponent } from './component/patient-summary/vital/vital.component';


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
    VitalComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatGridListModule,
    MatCardModule,
    HttpClientModule,
    RouterModule.forRoot([
      {path: '', component: ActiveVisitComponent},
      {path: 'patientDashboard/:id', component: PatientDashboardComponent},
      {path: 'patientSummary/:patient_id/:visit_id', component: PatientSummaryComponent}
  ])
 ],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/' },
    { provide: LocationStrategy, useClass: HashLocationStrategy }
],
  bootstrap: [AppComponent]
})
export class AppModule { }
