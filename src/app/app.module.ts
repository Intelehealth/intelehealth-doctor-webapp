import { BrowserModule } from "@angular/platform-browser";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import {
  CommonModule,
  APP_BASE_HREF,
  LocationStrategy,
  HashLocationStrategy,
} from "@angular/common";

// Component Import
import { AppComponent } from "./app.component";

// Package Import
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbActiveModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CookieService } from 'ngx-cookie-service';
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
import { CdkAccordionModule } from "@angular/cdk/accordion";
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
import { SocketService } from "./services/socket.service";
import { HoverClassDirective } from "./directives/hover-class.directive";
import { MatTabsModule } from "@angular/material/tabs";
import { Ng2TelInputModule } from "ng2-tel-input";
import { NgxCaptchaModule } from "ngx-captcha";
//Firebase services
import { AngularFireModule } from "@angular/fire";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { MatMenuModule } from "@angular/material/menu";

import { NgOtpInputModule } from "ng-otp-input";
import { OtpService } from "./services/otp.service";
import { NgSelectModule } from "@ng-select/ng-select";
import { TestComponent } from "./test/test.component";
import { PagerService } from "./services/pager.service";
import { ModalComponentsModule } from "./modal-components/modal-components.module";
import { ToastrModule } from "ngx-toastr";
import { AppRoutingModule } from './app-routing.module';
import { MatSidenavModule } from "@angular/material/sidenav";
import { MainContainerComponent } from './main-container/main-container.component';

import {
  NgxUiLoaderModule,
  NgxUiLoaderConfig,
  SPINNER,
  POSITION,
  PB_DIRECTION,
  NgxUiLoaderHttpModule,
} from "ngx-ui-loader";
import { NgxPermissionsModule } from "ngx-permissions";
import { NetworkInterceptor } from "./core/interceptors/network.interceptor";
import { ErrorInterceptor } from "./core/interceptors/error.interceptor";

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  bgsColor: "#2E1E91",
  bgsPosition: POSITION.bottomCenter,
  bgsSize: 40,
  bgsType: SPINNER.fadingCircle, // background spinner type
  fgsColor: "#FFFFFF", //#2E1E91
  fgsType: SPINNER.ballSpinClockwise, // foreground spinner type
  pbDirection: PB_DIRECTION.leftToRight, // progress bar direction
  pbThickness: 3, // progress bar thickness
  text: "Please Wait..."
};
import { MomentModule } from 'ngx-moment';
import { SharedModule } from "./shared.module";

@NgModule({
  declarations: [
    AppComponent,
    HoverClassDirective,
    TestComponent,
    MainContainerComponent
  ],

  imports: [
    MatSidenavModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      closeButton: true,
      tapToDismiss: false
    }),
    ModalComponentsModule,
    CdkAccordionModule,
    MatTabsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    NgxCaptchaModule,
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
    MomentModule,
    UserIdleModule.forRoot({ idle: 900, timeout: 30, ping: 12 }),
    ServiceWorkerModule.register("/intelehealth/ngsw-worker.js", {
      enabled: environment.production,
      registrationStrategy: "registerImmediately",
    }),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    AppRoutingModule,
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    NgxUiLoaderHttpModule.forRoot({
      showForeground: true,
      exclude: [
        'https://uiux.intelehealth.org:3004/api/messages/'
      ]
    }),
    NgxPermissionsModule.forRoot({
      permissionsIsolate: false,
      rolesIsolate: false,
      configurationIsolate: false
    }),
    SharedModule
  ],
  providers: [
    PagerService,
    OtpService,
    CookieService,
    DatePipe,
    MatDatepickerModule,
    MatNativeDateModule,
    SocketService,
    NgbActiveModal,
    { provide: APP_BASE_HREF, useValue: "/" },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NetworkInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}
