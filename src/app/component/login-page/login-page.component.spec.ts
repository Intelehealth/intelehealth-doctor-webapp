import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import {
  ComponentFixture,
  TestBed,
  async,
  getTestBed,
} from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "src/app/services/session.service";
import { LoginPageComponent } from "./login-page.component";
import { RouterTestingModule } from "@angular/router/testing";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

describe("LoginPageComponent", () => {
  let component: LoginPageComponent;
  let sessionService: SessionService;
  let authService: AuthService;
  let snackbar: MatSnackBar;
  let fixture: ComponentFixture<LoginPageComponent>;
  let injector: TestBed;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        MatSnackBarModule,
        BrowserAnimationsModule,
      ],
      declarations: [LoginPageComponent],
      providers: [SessionService, AuthService],
    });

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    injector = getTestBed();
    sessionService = injector.inject(SessionService);
    authService = injector.inject(AuthService);
    snackbar = injector.inject(MatSnackBar);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe("onInit", () => {
    it("should call ngOnInit with isLoggedIn true", async () => {
      authService.isLoggedIn = () => true;
      const navigateSpy = spyOn(component.router, "navigateByUrl");
      await component.ngOnInit();

      expect(authService.isLoggedIn()).toBeTruthy(true);
      expect(navigateSpy).toHaveBeenCalledWith("/home");
    });

    it("should call ngOnInit with isLoggedIn false", async () => {
      authService.isLoggedIn = () => false;

      await component.ngOnInit();
      expect(authService.isLoggedIn()).toBeFalsy(false);
    });
  });

  describe("onSubmit", () => {
    it("should call onSubmit with authenticated true", async () => {
      const navigateSpy = spyOn(component.router, "navigate");

      const RESPONSE = {
        sessionId: "7D71FC65ED11F4B12F0D34BC9F0C9213",
        authenticated: true,
        user: {
          uuid: "a4ac4fee-538f-11e6-9cfe-86f436325720",
          display: "admin",
          username: null,
          systemId: "admin",
          userProperties: {
            loginAttempts: "0",
          },
          person: {
            uuid: "1296b0dc-440a-11e6-a65c-00e04c680037",
            display: "Super User",
          },
          privileges: [
            {
              uuid: "26794822-93bf-477e-9a7e-1295c20741cc",
              display: "Manage HL7 Messages",
              name: "Manage HL7 Messages",
            },
            {
              uuid: "8e671164-ba76-499b-8a30-5a1bc2af9a7d",
              display: "Task: coreapps.createRetrospectiveVisit",
              name: "Task: coreapps.createRetrospectiveVisit",
            },
            {
              uuid: "133c06b4-45d1-43c4-a9f4-c3315bc364b4",
              display: "Manage Providers",
              name: "Manage Providers",
            },
            {
              uuid: "d4d4b78a-e92c-418f-ad89-af80ae3136ee",
              display: "Manage Appointments Settings",
              name: "Manage Appointments Settings",
            },
            {
              uuid: "75c5b275-8247-40c4-802a-f2e5e754a5fd",
              display: "View RESTWS",
              name: "View RESTWS",
            },
            {
              uuid: "9d5f32fb-538f-11e6-9cfe-86f436325720",
              display: "Edit Relationships",
              name: "Edit Relationships",
            },
            {
              uuid: "9d5f40eb-538f-11e6-9cfe-86f436325720",
              display: "Manage Programs",
              name: "Manage Programs",
            },
            {
              uuid: "9d5f470f-538f-11e6-9cfe-86f436325720",
              display: "Upload XSN",
              name: "Upload XSN",
            },
            {
              uuid: "9d5f4bbe-538f-11e6-9cfe-86f436325720",
              display: "View Concepts",
              name: "View Concepts",
            },
            {
              uuid: "9d5f2357-538f-11e6-9cfe-86f436325720",
              display: "Add Encounters",
              name: "Add Encounters",
            },
            {
              uuid: "c9d32a55-0c34-4e84-996f-885ccde4838e",
              display: "View XForms Menu",
              name: "View XForms Menu",
            },
            {
              uuid: "9d5f2fea-538f-11e6-9cfe-86f436325720",
              display: "Edit Encounters",
              name: "Edit Encounters",
            },
            {
              uuid: "2fffe318-a589-432c-bf26-b6e406573607",
              display: "View Provider Schedules",
              name: "View Provider Schedules",
            },
            {
              uuid: "9d5f49df-538f-11e6-9cfe-86f436325720",
              display: "View Concept Classes",
              name: "View Concept Classes",
            },
            {
              uuid: "7c8c5ce2-c469-44a0-87bc-6c0380789aaf",
              display: "Manage Visit Attribute Types",
              name: "Manage Visit Attribute Types",
            },
            {
              uuid: "70d9adfa-8d92-4813-907f-cb95f0ceeeec",
              display: "Task: coreapps.createVisit",
              name: "Task: coreapps.createVisit",
            },
            {
              uuid: "01219cc5-5087-4a59-b2a8-6e8224cf5619",
              display: "Add HL7 Inbound Queue",
              name: "Add HL7 Inbound Queue",
            },
            {
              uuid: "9d5f3f97-538f-11e6-9cfe-86f436325720",
              display: "Manage Order Types",
              name: "Manage Order Types",
            },
            {
              uuid: "9d5f2e20-538f-11e6-9cfe-86f436325720",
              display: "Delete Reports",
              name: "Delete Reports",
            },
            {
              uuid: "7ef70647-c772-4f86-ad4d-206355efc022",
              display: "Edit Allergies",
              name: "Edit Allergies",
            },
            {
              uuid: "e2fdeaf0-ea23-4e30-b457-44e120bc3b55",
              display: "Delete Patient Images",
              name: "Delete Patient Images",
            },
            {
              uuid: "9d5f3b2a-538f-11e6-9cfe-86f436325720",
              display: "Manage Concept Sources",
              name: "Manage Concept Sources",
            },
            {
              uuid: "f95d6230-c334-46ae-ad0c-2a07298348f4",
              display: "Task: coreapps.endVisit",
              name: "Task: coreapps.endVisit",
            },
            {
              uuid: "6da554cb-b94b-4265-b4ab-72caad49d944",
              display: "View Appointments",
              name: "View Appointments",
            },
            {
              uuid: "05646e28-542e-4f76-ad22-6d51a78c8684",
              display: "Delete Notes",
              name: "Delete Notes",
            },
            {
              uuid: "9d5f4a60-538f-11e6-9cfe-86f436325720",
              display: "View Concept Datatypes",
              name: "View Concept Datatypes",
            },
            {
              uuid: "1334a5dc-ae63-48da-9efc-97a2d81dacb4",
              display: "View Calculations",
              name: "View Calculations",
            },
            {
              uuid: "b8f592c0-fccd-4432-9c1c-d0f024893631",
              display: "Task: referenceapplication.simpleAdmission",
              name: "Task: referenceapplication.simpleAdmission",
            },
            {
              uuid: "530df190-8d86-43f2-aff8-7e9c0b085364",
              display: "Update HL7 Inbound Archive",
              name: "Update HL7 Inbound Archive",
            },
            {
              uuid: "9d5f449d-538f-11e6-9cfe-86f436325720",
              display: "Patient Dashboard - View Graphs Section",
              name: "Patient Dashboard - View Graphs Section",
            },
            {
              uuid: "9d5f38e9-538f-11e6-9cfe-86f436325720",
              display: "Edit Users",
              name: "Edit Users",
            },
            {
              uuid: "9d5f3f26-538f-11e6-9cfe-86f436325720",
              display: "Manage Modules",
              name: "Manage Modules",
            },
            {
              uuid: "9d5f2e93-538f-11e6-9cfe-86f436325720",
              display: "Delete Users",
              name: "Delete Users",
            },
            {
              uuid: "9d5f43a3-538f-11e6-9cfe-86f436325720",
              display: "Patient Dashboard - View Encounters Section",
              name: "Patient Dashboard - View Encounters Section",
            },
            {
              uuid: "3fc36409-7c3f-4949-98df-35bbb31a7129",
              display: "Update HL7 Inbound Exception",
              name: "Update HL7 Inbound Exception",
            },
            {
              uuid: "8676dbfe-ac8b-4a3e-b923-e98efe5d2515",
              display: "Manage Report Designs",
              name: "Manage Report Designs",
            },
            {
              uuid: "9d5f2b19-538f-11e6-9cfe-86f436325720",
              display: "Delete Orders",
              name: "Delete Orders",
            },
            {
              uuid: "43f7eeb4-9300-4693-b8db-7e6cb8c8c627",
              display: "List Groovy Scripts",
              name: "List Groovy Scripts",
            },
            {
              uuid: "341fac91-8389-4547-989a-e87c7cd85a89",
              display: "Manage Auto Generation Options",
              name: "Manage Auto Generation Options",
            },
            {
              uuid: "9d5f42b8-538f-11e6-9cfe-86f436325720",
              display: "Manage Scheduler",
              name: "Manage Scheduler",
            },
            {
              uuid: "9d5f3ba0-538f-11e6-9cfe-86f436325720",
              display: "Manage Concepts",
              name: "Manage Concepts",
            },
            {
              uuid: "9d5f51d1-538f-11e6-9cfe-86f436325720",
              display: "View Patient Identifiers",
              name: "View Patient Identifiers",
            },
            {
              uuid: "9d5f4ada-538f-11e6-9cfe-86f436325720",
              display: "View Concept Proposals",
              name: "View Concept Proposals",
            },
            {
              uuid: "9d5f2aae-538f-11e6-9cfe-86f436325720",
              display: "Delete Observations",
              name: "Delete Observations",
            },
            {
              uuid: "03684834-b0fe-4a47-bd75-791300c9bb2d",
              display: "Get conditions",
              name: "Get conditions",
            },
            {
              uuid: "d6c4b111-b215-429a-ae9d-4b405671f03b",
              display: "Patient Dashboard - Manage Patient Image",
              name: "Patient Dashboard - Manage Patient Image",
            },
            {
              uuid: "9d5f4b50-538f-11e6-9cfe-86f436325720",
              display: "View Concept Sources",
              name: "View Concept Sources",
            },
            {
              uuid: "9d5f47f3-538f-11e6-9cfe-86f436325720",
              display: "View Allergies",
              name: "View Allergies",
            },
            {
              uuid: "c95134c4-2f10-4f02-a8c4-049c6a25fb17",
              display: "Manage Data Set Definitions",
              name: "Manage Data Set Definitions",
            },
            {
              uuid: "9c07eac4-fab1-4702-8c9c-7958423bb318",
              display: "Manage Search Index",
              name: "Manage Search Index",
            },
            {
              uuid: "9d5f3133-538f-11e6-9cfe-86f436325720",
              display: "Edit Patient Identifiers",
              name: "Edit Patient Identifiers",
            },
            {
              uuid: "0010b658-f0bc-4974-8d4a-df0e8c70e396",
              display: "Manage Cohort Definitions",
              name: "Manage Cohort Definitions",
            },
            {
              uuid: "c3768cce-6d34-4ae2-882c-e07457a407f2",
              display: "Update HL7 Inbound Queue",
              name: "Update HL7 Inbound Queue",
            },
            {
              uuid: "9d5f3c8b-538f-11e6-9cfe-86f436325720",
              display: "Manage Field Types",
              name: "Manage Field Types",
            },
            {
              uuid: "ee0f10d8-1f19-4716-8e9d-81ea873c8193",
              display: "Manage Synonym Groups",
              name: "Manage Synonym Groups",
            },
            {
              uuid: "9d5f3c10-538f-11e6-9cfe-86f436325720",
              display: "Manage Encounter Types",
              name: "Manage Encounter Types",
            },
            {
              uuid: "9d5f4ec7-538f-11e6-9cfe-86f436325720",
              display: "View Identifier Types",
              name: "View Identifier Types",
            },
            {
              uuid: "9d5f24a8-538f-11e6-9cfe-86f436325720",
              display: "Add Orders",
              name: "Add Orders",
            },
            {
              uuid: "9d5f461e-538f-11e6-9cfe-86f436325720",
              display: "Patient Dashboard - View Regimen Section",
              name: "Patient Dashboard - View Regimen Section",
            },
            {
              uuid: "9d5f539e-538f-11e6-9cfe-86f436325720",
              display: "View Person Attribute Types",
              name: "View Person Attribute Types",
            },
            {
              uuid: "9d5f5786-538f-11e6-9cfe-86f436325720",
              display: "View Roles",
              name: "View Roles",
            },
            {
              uuid: "9c92cd82-572b-4801-a4f8-cb99ae2a3402",
              display: "Assign System Developer Role",
              name: "Assign System Developer Role",
            },
            {
              uuid: "9d5f2a43-538f-11e6-9cfe-86f436325720",
              display: "Delete Encounters",
              name: "Delete Encounters",
            },
            {
              uuid: "a02c4af8-43c0-4660-a0df-7f1aaed8d281",
              display: "App: coreapps.findPatient",
              name: "App: coreapps.findPatient",
            },
            {
              uuid: "d8a86a42-12c8-496f-abfe-425b7260b74f",
              display: "Patient Dashboard - View Visits Section",
              name: "Patient Dashboard - View Visits Section",
            },
            {
              uuid: "9d5f540e-538f-11e6-9cfe-86f436325720",
              display: "View Privileges",
              name: "View Privileges",
            },
            {
              uuid: "9d5f2f77-538f-11e6-9cfe-86f436325720",
              display: "Edit Concept Proposals",
              name: "Edit Concept Proposals",
            },
            {
              uuid: "f7ef780a-60cf-48cb-8ed8-48ec4b671348",
              display: "Preview Forms",
              name: "Preview Forms",
            },
            {
              uuid: "6bfb5b23-690e-42e5-9b5b-3b8f03e94132",
              display: "Provider Management - Admin",
              name: "Provider Management - Admin",
            },
            {
              uuid: "9d5f26a1-538f-11e6-9cfe-86f436325720",
              display: "Add Patients",
              name: "Add Patients",
            },
            {
              uuid: "9d5f3eba-538f-11e6-9cfe-86f436325720",
              display: "Manage Locations",
              name: "Manage Locations",
            },
            {
              uuid: "9d5f27a9-538f-11e6-9cfe-86f436325720",
              display: "Add Relationships",
              name: "Add Relationships",
            },
            {
              uuid: "9d5f2c57-538f-11e6-9cfe-86f436325720",
              display: "Delete Patients",
              name: "Delete Patients",
            },
            {
              uuid: "336678a3-16f9-4f42-aaaa-0f179219e86c",
              display: "App: coreapps.configuremetadata",
              name: "App: coreapps.configuremetadata",
            },
            {
              uuid: "9d5f3e4c-538f-11e6-9cfe-86f436325720",
              display: "Manage Identifier Types",
              name: "Manage Identifier Types",
            },
            {
              uuid: "ccff4d5c-3f8d-44b6-bcfb-97e72bf142ea",
              display: "Manage Encounter Roles",
              name: "Manage Encounter Roles",
            },
            {
              uuid: "9dc333bf-1a04-4c44-8779-6f71dd646b9a",
              display: "Delete HL7 Inbound Archive",
              name: "Delete HL7 Inbound Archive",
            },
            {
              uuid: "c2348fd3-a7ca-43ee-863f-bd37eb0f7b70",
              display: "Task: coreapps.mergeVisits",
              name: "Task: coreapps.mergeVisits",
            },
            {
              uuid: "e5346d0c-4c30-4bb0-9420-4cc77a9ad1c1",
              display: "Manage Token Registrations",
              name: "Manage Token Registrations",
            },
            {
              uuid: "3eb44704-718e-4fd1-97e9-c9f17e11db94",
              display: "View Metadata Via Mapping",
              name: "View Metadata Via Mapping",
            },
            {
              uuid: "07dd82be-89db-45e6-84dd-211c617c2d79",
              display: "App: coreapps.patientDashboard",
              name: "App: coreapps.patientDashboard",
            },
            {
              uuid: "aa6c49a2-0b27-4cb3-9705-559beeffc265",
              display: "Manage Order Frequencies",
              name: "Manage Order Frequencies",
            },
            {
              uuid: "6613e8da-f27c-4914-8b85-4917ce78d622",
              display: "Update Appointment Status",
              name: "Update Appointment Status",
            },
            {
              uuid: "2b413a2d-9cdb-4afb-84ba-c991dc798007",
              display: "Manage Metadata Mapping",
              name: "Manage Metadata Mapping",
            },
            {
              uuid: "2f2d1f73-3ad8-4c6d-851f-70e6abf13074",
              display: "Manage Implementation Id",
              name: "Manage Implementation Id",
            },
            {
              uuid: "9d5f4c2b-538f-11e6-9cfe-86f436325720",
              display: "View Data Entry Statistics",
              name: "View Data Entry Statistics",
            },
            {
              uuid: "234d6d00-50b8-4dc2-b14d-3d6bc764bee7",
              display: "Manage Server Log",
              name: "Manage Server Log",
            },
            {
              uuid: "46bba946-3f16-4ce7-8514-2d7ce9919857",
              display: "Manage Visit Types",
              name: "Manage Visit Types",
            },
            {
              uuid: "9d5f4161-538f-11e6-9cfe-86f436325720",
              display: "Manage Relationship Types",
              name: "Manage Relationship Types",
            },
            {
              uuid: "e2c60a7f-0256-4575-8084-b0064a8058c8",
              display: "Manage Encounter Queue",
              name: "Manage Encounter Queue",
            },
            {
              uuid: "9d5f4420-538f-11e6-9cfe-86f436325720",
              display: "Patient Dashboard - View Forms Section",
              name: "Patient Dashboard - View Forms Section",
            },
            {
              uuid: "9d5f5871-538f-11e6-9cfe-86f436325720",
              display: "View Users",
              name: "View Users",
            },
            {
              uuid: "d0b37a09-341a-4268-a2a3-dfc34f90f45e",
              display: "Edit Notes",
              name: "Edit Notes",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a215",
              display: "Get Visit Types",
              name: "Get Visit Types",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a216",
              display: "Get HL7 Inbound Exception",
              name: "Get HL7 Inbound Exception",
            },
            {
              uuid: "3c0768b2-03a9-4cfd-aa0e-fe1c366df2bf",
              display: "Manage synonym group",
              name: "Manage synonym group",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a213",
              display: "Get Visit Attribute Types",
              name: "Get Visit Attribute Types",
            },
            {
              uuid: "4adb0e30-b9d3-4144-b398-33a65f8120ba",
              display: "Squeezing Appointments",
              name: "Squeezing Appointments",
            },
            {
              uuid: "7a5a8ace-63ca-4cc1-a8ef-fff5ee5db562",
              display: "Edit conditions",
              name: "Edit conditions",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a214",
              display: "Get Visits",
              name: "Get Visits",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a211",
              display: "Get Providers",
              name: "Get Providers",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a212",
              display: "Get Location Attribute Types",
              name: "Get Location Attribute Types",
            },
            {
              uuid: "503152f1-b776-4703-ba88-f526c417db6f",
              display: "App: appointmentschedulingui.providerSchedules",
              name: "App: appointmentschedulingui.providerSchedules",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a210",
              display: "Get Encounter Roles",
              name: "Get Encounter Roles",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a219",
              display: "Get HL7 Source",
              name: "Get HL7 Source",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a217",
              display: "Get HL7 Inbound Archive",
              name: "Get HL7 Inbound Archive",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a218",
              display: "Get HL7 Inbound Queue",
              name: "Get HL7 Inbound Queue",
            },
            {
              uuid: "9d5f2288-538f-11e6-9cfe-86f436325720",
              display: "Add Concept Proposals",
              name: "Add Concept Proposals",
            },
            {
              uuid: "d17697ec-19fe-4a42-8331-56188a654077",
              display: "Provider Management Dashboard - View Historical",
              name: "Provider Management Dashboard - View Historical",
            },
            {
              uuid: "82edbc1c-38af-419f-959c-8274980fa459",
              display: "Edit Patient Images",
              name: "Edit Patient Images",
            },
            {
              uuid: "9d5f5479-538f-11e6-9cfe-86f436325720",
              display: "View Problems",
              name: "View Problems",
            },
            {
              uuid: "ea01099e-0e8d-42de-812d-b6421199e7a6",
              display: "Run Groovy Scripts",
              name: "Run Groovy Scripts",
            },
            {
              uuid: "c07af105-8356-4cb5-b539-166292e5dc43",
              display: "Manage Provider Schedules",
              name: "Manage Provider Schedules",
            },
            {
              uuid: "9d5f31a3-538f-11e6-9cfe-86f436325720",
              display: "Edit Patient Programs",
              name: "Edit Patient Programs",
            },
            {
              uuid: "9d5f432a-538f-11e6-9cfe-86f436325720",
              display: "Patient Dashboard - View Demographics Section",
              name: "Patient Dashboard - View Demographics Section",
            },
            {
              uuid: "3351328d-3627-4229-98bd-890c1d93aff0",
              display: "App: coreapps.activeVisits",
              name: "App: coreapps.activeVisits",
            },
            {
              uuid: "2a3ef3b0-e261-438c-a7ed-cae605863eed",
              display: "Manage Concept Name tags",
              name: "Manage Concept Name tags",
            },
            {
              uuid: "9d5f2408-538f-11e6-9cfe-86f436325720",
              display: "Add Observations",
              name: "Add Observations",
            },
            {
              uuid: "9d5f3289-538f-11e6-9cfe-86f436325720",
              display: "Edit People",
              name: "Edit People",
            },
            {
              uuid: "58a6755b-fdd5-4730-b8e1-a61836d460f7",
              display: "Add Allergies",
              name: "Add Allergies",
            },
            {
              uuid: "9da4d203-a834-4bde-87b7-a15bb0533ca5",
              display: "Task: referenceapplication.simpleDischarge",
              name: "Task: referenceapplication.simpleDischarge",
            },
            {
              uuid: "c9ce8d80-8139-46cd-b074-9fffac3784a7",
              display: "Run Reports",
              name: "Run Reports",
            },
            {
              uuid: "9d5f2cc7-538f-11e6-9cfe-86f436325720",
              display: "Delete People",
              name: "Delete People",
            },
            {
              uuid: "86aa69be-62a1-4909-8022-085ebac46ee6",
              display: "Manage RESTWS",
              name: "Manage RESTWS",
            },
            {
              uuid: "e6e13a78-2ec0-45f0-9ba6-9660dca81b0f",
              display: "Provider Management API - Read-only",
              name: "Provider Management API - Read-only",
            },
            {
              uuid: "9d5f5160-538f-11e6-9cfe-86f436325720",
              display: "View Patient Cohorts",
              name: "View Patient Cohorts",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a237",
              display: "Get Concept Datatypes",
              name: "Get Concept Datatypes",
            },
            {
              uuid: "f71fb1a2-3472-4683-bf71-56ead9154488",
              display: "Schedule Appointments",
              name: "Schedule Appointments",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a238",
              display: "Get Concept Classes",
              name: "Get Concept Classes",
            },
            {
              uuid: "9d5f3cf9-538f-11e6-9cfe-86f436325720",
              display: "Manage FormEntry XSN",
              name: "Manage FormEntry XSN",
            },
            {
              uuid: "9d5f5641-538f-11e6-9cfe-86f436325720",
              display: "View Relationships",
              name: "View Relationships",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a235",
              display: "Get Roles",
              name: "Get Roles",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a236",
              display: "Get Privileges",
              name: "Get Privileges",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a233",
              display: "Get Order Types",
              name: "Get Order Types",
            },
            {
              uuid: "9d5f3a49-538f-11e6-9cfe-86f436325720",
              display: "Manage Concept Classes",
              name: "Manage Concept Classes",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a234",
              display: "Get Field Types",
              name: "Get Field Types",
            },
            {
              uuid: "68dd977c-e685-43b4-a9c5-4080acd6ee2d",
              display: "App: coreapps.patientVisits",
              name: "App: coreapps.patientVisits",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a231",
              display: "Get Concept Sources",
              name: "Get Concept Sources",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a232",
              display: "Get Relationship Types",
              name: "Get Relationship Types",
            },
            {
              uuid: "f9503020-caf6-43d2-b807-039d7d42e2e8",
              display: "Provider Management Dashboard - View Patients",
              name: "Provider Management Dashboard - View Patients",
            },
            {
              uuid: "1b7efef6-dfde-43b9-90a6-892b9c38a118",
              display: "Manage OWA",
              name: "Manage OWA",
            },
            {
              uuid: "78957b8b-baac-43fc-b31f-d489820b96b8",
              display: "Remove Problems",
              name: "Remove Problems",
            },
            {
              uuid: "d0c2f230-7edc-4c1c-bee6-79d0dfe1617f",
              display: "App: atlas.manage",
              name: "App: atlas.manage",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a239",
              display: "Get Identifier Types",
              name: "Get Identifier Types",
            },
            {
              uuid: "d04dcfbc-189d-4c23-9d7e-a71ef5a36648",
              display: "App: coreapps.systemAdministration",
              name: "App: coreapps.systemAdministration",
            },
            {
              uuid: "9d5f2548-538f-11e6-9cfe-86f436325720",
              display: "Add Patient Identifiers",
              name: "Add Patient Identifiers",
            },
            {
              uuid: "9d5f3219-538f-11e6-9cfe-86f436325720",
              display: "Edit Patients",
              name: "Edit Patients",
            },
            {
              uuid: "643ffb69-458f-4058-94c3-4590528eb173",
              display: "Update HL7 Source",
              name: "Update HL7 Source",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a240",
              display: "Get Forms",
              name: "Get Forms",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a241",
              display: "Get Orders",
              name: "Get Orders",
            },
            {
              uuid: "1059dd50-b2ef-49ce-8833-1651b695a431",
              display: "App: appointmentschedulingui.viewAppointments",
              name: "App: appointmentschedulingui.viewAppointments",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a226",
              display: "Get Global Properties",
              name: "Get Global Properties",
            },
            {
              uuid: "9d5f4242-538f-11e6-9cfe-86f436325720",
              display: "Manage Roles",
              name: "Manage Roles",
            },
            {
              uuid: "25a17722-8641-4db9-877c-672e1453d6d1",
              display: "Request Appointments",
              name: "Request Appointments",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a227",
              display: "Get Patient Programs",
              name: "Get Patient Programs",
            },
            {
              uuid: "9d5f28f7-538f-11e6-9cfe-86f436325720",
              display: "Add Users",
              name: "Add Users",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a224",
              display: "Get People",
              name: "Get People",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a225",
              display: "Get Person Attribute Types",
              name: "Get Person Attribute Types",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a222",
              display: "Get Database Changes",
              name: "Get Database Changes",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a223",
              display: "Get Relationships",
              name: "Get Relationships",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a220",
              display: "Get Allergies",
              name: "Get Allergies",
            },
            {
              uuid: "1f3f4fa0-075d-4ab8-b325-e259b41949a9",
              display: "Add Patient Images",
              name: "Add Patient Images",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a221",
              display: "Get Problems",
              name: "Get Problems",
            },
            {
              uuid: "c3508de9-9747-46f8-aa01-3b88223f0d0a",
              display: "View FHIR Client",
              name: "View FHIR Client",
            },
            {
              uuid: "579267f4-a4c4-4de1-9807-1fbf054c6a80",
              display: "Get Concept Attribute Types",
              name: "Get Concept Attribute Types",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a228",
              display: "Get Programs",
              name: "Get Programs",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a229",
              display: "Get Concept Reference Terms",
              name: "Get Concept Reference Terms",
            },
            {
              uuid: "9d5f2962-538f-11e6-9cfe-86f436325720",
              display: "Delete Cohorts",
              name: "Delete Cohorts",
            },
            {
              uuid: "9d5f507f-538f-11e6-9cfe-86f436325720",
              display: "View Order Types",
              name: "View Order Types",
            },
            {
              uuid: "a0691db3-3ea8-45fb-8a61-1e2e1c463191",
              display: "Delete HL7 Inbound Queue",
              name: "Delete HL7 Inbound Queue",
            },
            {
              uuid: "9d5f30c7-538f-11e6-9cfe-86f436325720",
              display: "Edit Orders",
              name: "Edit Orders",
            },
            {
              uuid: "d3254853-7004-45e0-8351-52e888ab4de2",
              display: "Manage Atlas Data",
              name: "Manage Atlas Data",
            },
            {
              uuid: "792b28bd-b111-4986-96f5-e64173871697",
              display: "View Patient Appointment History",
              name: "View Patient Appointment History",
            },
            {
              uuid: "6d0b85b7-fd8f-49f1-8d3e-fdc2c4872154",
              display: "Get Order Frequencies",
              name: "Get Order Frequencies",
            },
            {
              uuid: "15568107-b26c-4027-9435-f6e4927c501d",
              display: "Add Problems",
              name: "Add Problems",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a230",
              display: "Get Concept Map Types",
              name: "Get Concept Map Types",
            },
            {
              uuid: "9d5f4004-538f-11e6-9cfe-86f436325720",
              display: "Manage Person Attribute Types",
              name: "Manage Person Attribute Types",
            },
            {
              uuid: "4d45ac52-ad2b-451f-8ccf-4a9157285572",
              display: "Remove Allergies",
              name: "Remove Allergies",
            },
            {
              uuid: "ae413bf7-c0d2-4b5a-8082-2fb8ebbe3590",
              display: "View Encounter Queue",
              name: "View Encounter Queue",
            },
            {
              uuid: "9d5f273b-538f-11e6-9cfe-86f436325720",
              display: "Add People",
              name: "Add People",
            },
            {
              uuid: "9d5f4780-538f-11e6-9cfe-86f436325720",
              display: "View Administration Functions",
              name: "View Administration Functions",
            },
            {
              uuid: "189c264d-0ae9-49a9-a022-caefa8e69b66",
              display: "Task: Modify Allergies",
              name: "Task: Modify Allergies",
            },
            {
              uuid: "15614904-9dbc-4b51-aa5c-2f6ed4ed1432",
              display: "Edit Problems",
              name: "Edit Problems",
            },
            {
              uuid: "ec57fe60-011c-4eaa-9fa0-f745bd638760",
              display: "Manage Concept Map Types",
              name: "Manage Concept Map Types",
            },
            {
              uuid: "41d47212-b219-4eb0-9924-ce116da948b6",
              display: "Manage Indicator Definitions",
              name: "Manage Indicator Definitions",
            },
            {
              uuid: "ad55f7a9-4d46-4be1-a7f1-206c18839b86",
              display: "Provider Management Dashboard - Edit Providers",
              name: "Provider Management Dashboard - Edit Providers",
            },
            {
              uuid: "9d5f469f-538f-11e6-9cfe-86f436325720",
              display: "Purge Field Types",
              name: "Purge Field Types",
            },
            {
              uuid: "3b9b07a9-86ff-423c-a200-de38464bf3bd",
              display: "View Appointments Statistics",
              name: "View Appointments Statistics",
            },
            {
              uuid: "9d5f2dab-538f-11e6-9cfe-86f436325720",
              display: "Delete Report Objects",
              name: "Delete Report Objects",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a262",
              display: "Patient Overview - View Relationships",
              name: "Patient Overview - View Relationships",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a263",
              display: "Patient Overview - View Programs",
              name: "Patient Overview - View Programs",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a260",
              display: "Patient Overview - View Problem List",
              name: "Patient Overview - View Problem List",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a261",
              display: "Patient Overview - View Allergies",
              name: "Patient Overview - View Allergies",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a248",
              display: "Get Encounters",
              name: "Get Encounters",
            },
            {
              uuid: "f9f2b028-ce9b-4a8d-bba8-3bf86f61070e",
              display: "Manage Location Attribute Types",
              name: "Manage Location Attribute Types",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a249",
              display: "Get Users",
              name: "Get Users",
            },
            {
              uuid: "13b0115b-6860-4a2e-8a2e-9501daabc259",
              display: "Manage Concept Stop Words",
              name: "Manage Concept Stop Words",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a246",
              display: "Get Locations",
              name: "Get Locations",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a247",
              display: "Get Encounter Types",
              name: "Get Encounter Types",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a244",
              display: "Get Patients",
              name: "Get Patients",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a245",
              display: "Get Observations",
              name: "Get Observations",
            },
            {
              uuid: "7b6add49-5825-4e25-8b66-f6336fcca6e3",
              display: "Add HL7 Inbound Exception",
              name: "Add HL7 Inbound Exception",
            },
            {
              uuid: "9fd96a2b-2c1e-49d0-b7d0-da87bcb2d13f",
              display: "Get Notes",
              name: "Get Notes",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a242",
              display: "Get Patient Cohorts",
              name: "Get Patient Cohorts",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a243",
              display: "Get Patient Identifiers",
              name: "Get Patient Identifiers",
            },
            {
              uuid: "e6cd2f5b-c2ad-493e-9012-8ef4832455f1",
              display: "Manage Scheduled Report Tasks",
              name: "Manage Scheduled Report Tasks",
            },
            {
              uuid: "9d5f3d6e-538f-11e6-9cfe-86f436325720",
              display: "Manage Forms",
              name: "Manage Forms",
            },
            {
              uuid: "888edd56-080f-4a40-bc16-9fcd242da7c1",
              display: "App: formentryapp.forms",
              name: "App: formentryapp.forms",
            },
            {
              uuid: "5b55a79b-2adc-428e-abb2-d9dc82bcbd76",
              display: "View Appointments Blocks",
              name: "View Appointments Blocks",
            },
            {
              uuid: "9d5f5015-538f-11e6-9cfe-86f436325720",
              display: "View Observations",
              name: "View Observations",
            },
            {
              uuid: "06fe79e1-4567-475e-a257-3fa6dcd4cf72",
              display: "Run Chart Search commands",
              name: "Run Chart Search commands",
            },
            {
              uuid: "9d5f52c0-538f-11e6-9cfe-86f436325720",
              display: "View Patients",
              name: "View Patients",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a251",
              display: "Get Concepts",
              name: "Get Concepts",
            },
            {
              uuid: "9d5f55d4-538f-11e6-9cfe-86f436325720",
              display: "View Relationship Types",
              name: "View Relationship Types",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a250",
              display: "Get Concept Proposals",
              name: "Get Concept Proposals",
            },
            {
              uuid: "1b18dff6-7920-42be-a43c-ca51a7827c0d",
              display: "Delete Visits",
              name: "Delete Visits",
            },
            {
              uuid: "9d5f57f9-538f-11e6-9cfe-86f436325720",
              display: "View Unpublished Forms",
              name: "View Unpublished Forms",
            },
            {
              uuid: "15fa9977-b0d1-45cc-930a-2529a35de9f1",
              display: "Patient Overview - View Patient Flags",
              name: "Patient Overview - View Patient Flags",
            },
            {
              uuid: "14ffaae8-89dd-4d49-a93d-4b17acb48502",
              display: "Manage Dimension Definitions",
              name: "Manage Dimension Definitions",
            },
            {
              uuid: "7ac72a30-106b-42fe-9d6c-4cd82a43bae7",
              display: "Edit Visits",
              name: "Edit Visits",
            },
            {
              uuid: "9d5f396e-538f-11e6-9cfe-86f436325720",
              display: "Form Entry",
              name: "Form Entry",
            },
            {
              uuid: "e6d598d2-5831-4cdd-8e78-3a0d71bc1051",
              display: "Manage Concept Reference Terms",
              name: "Manage Concept Reference Terms",
            },
            {
              uuid: "7cdd31a9-b3ea-43de-9111-255cfe79301b",
              display: "Upload Batch of Identifiers",
              name: "Upload Batch of Identifiers",
            },
            {
              uuid: "f2ea409a-4c4c-4299-9954-5aa57a60f6ed",
              display: "View Patient Images",
              name: "View Patient Images",
            },
            {
              uuid: "9d5f3dd9-538f-11e6-9cfe-86f436325720",
              display: "Manage Global Properties",
              name: "Manage Global Properties",
            },
            {
              uuid: "143caf1a-d435-471d-8952-d6751e9a4da6",
              display: "App: appointmentschedulingui.appointmentTypes",
              name: "App: appointmentschedulingui.appointmentTypes",
            },
            {
              uuid: "f66213ce-d1e1-4fbd-a779-d43c0e827ad6",
              display: "Patient Dashboard - View Chart Search Section",
              name: "Patient Dashboard - View Chart Search Section",
            },
            {
              uuid: "1cc6b816-f0bc-4d92-8ca3-c700c1b797f1",
              display: "Add Visits",
              name: "Add Visits",
            },
            {
              uuid: "6001e79d-e30d-4ee0-88c7-b978a39afb37",
              display: "Get Care Settings",
              name: "Get Care Settings",
            },
            {
              uuid: "2d72a24b-f8fe-44de-8667-2f8df197fdb9",
              display: "Provider Management API",
              name: "Provider Management API",
            },
            {
              uuid: "d05118c6-2490-4d78-a41a-390e3596a264",
              display: "Patient Overview - View Patient Actions",
              name: "Patient Overview - View Patient Actions",
            },
            {
              uuid: "9d5f41d4-538f-11e6-9cfe-86f436325720",
              display: "Manage Relationships",
              name: "Manage Relationships",
            },
            {
              uuid: "9d5f4d83-538f-11e6-9cfe-86f436325720",
              display: "View Field Types",
              name: "View Field Types",
            },
            {
              uuid: "a3e0ad73-2ba6-416a-b2c3-3b7e535b1a02",
              display: "Task: referenceapplication.simpleVisitNote",
              name: "Task: referenceapplication.simpleVisitNote",
            },
            {
              uuid: "2bba5334-07e6-45df-8b2c-3e2696d5f130",
              display: "Configure Visits",
              name: "Configure Visits",
            },
            {
              uuid: "42f5560a-bfde-4fa4-8818-3d10c85162db",
              display: "Manage Report Definitions",
              name: "Manage Report Definitions",
            },
            {
              uuid: "9d6bb570-49ad-4381-9928-4ef5df636fb3",
              display: "Add HL7 Source",
              name: "Add HL7 Source",
            },
            {
              uuid: "89f255bf-7f2d-4a3f-9e37-2b74c37e54a6",
              display: "Manage Appointment Types",
              name: "Manage Appointment Types",
            },
            {
              uuid: "9d5f2f05-538f-11e6-9cfe-86f436325720",
              display: "Edit Cohorts",
              name: "Edit Cohorts",
            },
            {
              uuid: "9d5f570f-538f-11e6-9cfe-86f436325720",
              display: "View Reports",
              name: "View Reports",
            },
            {
              uuid: "9d5f3ab8-538f-11e6-9cfe-86f436325720",
              display: "Manage Concept Datatypes",
              name: "Manage Concept Datatypes",
            },
            {
              uuid: "9d5f2bf0-538f-11e6-9cfe-86f436325720",
              display: "Delete Patient Programs",
              name: "Delete Patient Programs",
            },
            {
              uuid: "9d5f2d3b-538f-11e6-9cfe-86f436325720",
              display: "Delete Relationships",
              name: "Delete Relationships",
            },
            {
              uuid: "2ff5add7-18d9-4279-b918-3bc7ab66c134",
              display: "Task: referenceapplication.simpleTransfer",
              name: "Task: referenceapplication.simpleTransfer",
            },
            {
              uuid: "44f3ddf8-76e1-437d-b81d-70dd1a485a51",
              display: "App: appointmentschedulingui.home",
              name: "App: appointmentschedulingui.home",
            },
            {
              uuid: "9d5f56a7-538f-11e6-9cfe-86f436325720",
              display: "View Report Objects",
              name: "View Report Objects",
            },
            {
              uuid: "9d5f29cd-538f-11e6-9cfe-86f436325720",
              display: "Delete Concept Proposals",
              name: "Delete Concept Proposals",
            },
            {
              uuid: "9d5f532f-538f-11e6-9cfe-86f436325720",
              display: "View People",
              name: "View People",
            },
            {
              uuid: "f71000a7-5793-4330-8c58-88d871aacce8",
              display: "View Token Registrations",
              name: "View Token Registrations",
            },
            {
              uuid: "9d5f4c9f-538f-11e6-9cfe-86f436325720",
              display: "View Encounter Types",
              name: "View Encounter Types",
            },
            {
              uuid: "cf2aa5a0-4f92-4db3-8c50-380f3de82c0b",
              display: "Add HL7 Inbound Archive",
              name: "Add HL7 Inbound Archive",
            },
            {
              uuid: "eebd47f6-c335-4108-ba78-d955c19400ad",
              display: "Manage Concept Attribute Types",
              name: "Manage Concept Attribute Types",
            },
            {
              uuid: "9d5f451f-538f-11e6-9cfe-86f436325720",
              display: "Patient Dashboard - View Overview Section",
              name: "Patient Dashboard - View Overview Section",
            },
            {
              uuid: "9d5f45a2-538f-11e6-9cfe-86f436325720",
              display: "Patient Dashboard - View Patient Summary",
              name: "Patient Dashboard - View Patient Summary",
            },
            {
              uuid: "9d5f25f8-538f-11e6-9cfe-86f436325720",
              display: "Add Patient Programs",
              name: "Add Patient Programs",
            },
            {
              uuid: "9d5f524c-538f-11e6-9cfe-86f436325720",
              display: "View Patient Programs",
              name: "View Patient Programs",
            },
            {
              uuid: "9d5f4df2-538f-11e6-9cfe-86f436325720",
              display: "View Forms",
              name: "View Forms",
            },
            {
              uuid: "62a8b54a-5c1b-42e4-a875-a1f8fcd9ff48",
              display: "Manage Identifier Sources",
              name: "Manage Identifier Sources",
            },
            {
              uuid: "9d5f2b83-538f-11e6-9cfe-86f436325720",
              display: "Delete Patient Identifiers",
              name: "Delete Patient Identifiers",
            },
            {
              uuid: "9d5f3057-538f-11e6-9cfe-86f436325720",
              display: "Edit Observations",
              name: "Edit Observations",
            },
            {
              uuid: "9d5f4e5a-538f-11e6-9cfe-86f436325720",
              display: "View Global Properties",
              name: "View Global Properties",
            },
            {
              uuid: "5371d7a3-f9eb-4ff5-842e-083cb7a7af0c",
              display: "Get Order Sets",
              name: "Get Order Sets",
            },
            {
              uuid: "25c7a46a-a94d-48e7-8062-a54c004c2bdd",
              display: "Manage Test Data",
              name: "Manage Test Data",
            },
            {
              uuid: "9d5f39d9-538f-11e6-9cfe-86f436325720",
              display: "Manage Alerts",
              name: "Manage Alerts",
            },
            {
              uuid: "974f3c91-4d8c-49b8-87ed-cb15314aa0f0",
              display: "Task: appointmentschedulingui.requestAppointments",
              name: "Task: appointmentschedulingui.requestAppointments",
            },
            {
              uuid: "f8ed8cb3-beed-4c26-9583-67a5f0254d73",
              display: "Generate Batch of Identifiers",
              name: "Generate Batch of Identifiers",
            },
            {
              uuid: "4cf0f071-4c9d-4a35-9cc9-b195051ff8f2",
              display: "Manage Reports",
              name: "Manage Reports",
            },
            {
              uuid: "ad3e1fdc-763d-48ea-b0dd-d54e28a2e662",
              display: "Provider Management Dashboard - Edit Patients",
              name: "Provider Management Dashboard - Edit Patients",
            },
            {
              uuid: "9d5f20e8-538f-11e6-9cfe-86f436325720",
              display: "Add Cohorts",
              name: "Add Cohorts",
            },
            {
              uuid: "9d5f4d14-538f-11e6-9cfe-86f436325720",
              display: "View Encounters",
              name: "View Encounters",
            },
            {
              uuid: "dee06e98-7841-47f8-8239-1fa0188df126",
              display: "Manage Location Tags",
              name: "Manage Location Tags",
            },
            {
              uuid: "4769cd64-661a-484d-9449-4852f421079c",
              display: "Manage Order Sets",
              name: "Manage Order Sets",
            },
            {
              uuid: "aa8ccbb0-0db3-48f3-b496-5ed78e76b58d",
              display: "App: referenceapplication.legacyAdmin",
              name: "App: referenceapplication.legacyAdmin",
            },
            {
              uuid: "9d5f3807-538f-11e6-9cfe-86f436325720",
              display: "Edit User Passwords",
              name: "Edit User Passwords",
            },
            {
              uuid: "0cdf7649-2592-4a5b-a3c3-e0713d47c031",
              display: "View Appointment Types",
              name: "View Appointment Types",
            },
            {
              uuid: "9d5f50f0-538f-11e6-9cfe-86f436325720",
              display: "View Orders",
              name: "View Orders",
            },
            {
              uuid: "9d5f4f39-538f-11e6-9cfe-86f436325720",
              display: "View Locations",
              name: "View Locations",
            },
            {
              uuid: "5f722d77-2905-45de-a832-10cfda1ba4d4",
              display: "Delete HL7 Inbound Exception",
              name: "Delete HL7 Inbound Exception",
            },
            {
              uuid: "e1a44fe0-f0fd-428e-9d27-5c1c83f241f4",
              display: "Manage Address Templates",
              name: "Manage Address Templates",
            },
            {
              uuid: "9d5f4fa7-538f-11e6-9cfe-86f436325720",
              display: "View Navigation Menu",
              name: "View Navigation Menu",
            },
            {
              uuid: "9d5f5569-538f-11e6-9cfe-86f436325720",
              display: "View Programs",
              name: "View Programs",
            },
            {
              uuid: "69df5825-6cde-420f-9d7d-4fc866b9861b",
              display: "Provider Management Dashboard - View Providers",
              name: "Provider Management Dashboard - View Providers",
            },
          ],
          roles: [
            {
              uuid: "7ca52394-49ba-4026-a087-1c6f2028a745",
              display: "Application: Writes Clinical Notes",
              name: "Application: Writes Clinical Notes",
            },
            {
              uuid: "f6de773b-277e-4ce2-9ee6-8622b8a293e8",
              display: "Organizational: System Administrator",
              name: "Organizational: System Administrator",
            },
            {
              uuid: "8d94f852-c2cc-11de-8d13-0010c6dffd0f",
              display: "System Developer",
              name: "System Developer",
            },
            {
              uuid: "a5df6aa5-d6e5-4b56-b0e7-315ee0899f97",
              display: "Organizational: Doctor",
              name: "Organizational: Doctor",
            },
            {
              uuid: "dd5e899c-0f6a-4021-abec-a2465d1c1e50",
              display: "Application: Uses Patient Summary",
              name: "Application: Uses Patient Summary",
            },
            {
              uuid: "8d94f280-c2cc-11de-8d13-0010c6dffd0f",
              display: "Provider",
              name: "Provider",
            },
          ],
          links: [
            {
              rel: "self",
              uri: "http://127.0.0.1:8080/openmrs/ws/rest/v1/user/a4ac4fee-538f-11e6-9cfe-86f436325720",
            },
            {
              rel: "default",
              uri: "http://127.0.0.1:8080/openmrs/ws/rest/v1/user/a4ac4fee-538f-11e6-9cfe-86f436325720?v=default",
            },
          ],
        },
        locale: "en",
        allowedLocales: ["en", "es", "fr", "it", "pt"],
        sessionLocation: null,
        currentProvider: {
          uuid: "f9badd80-ab76-11e2-9e96-0800200c9a66",
          display: "UNKNOWN - Super User",
          links: [
            {
              rel: "self",
              uri: "http://127.0.0.1:8080/openmrs/ws/rest/v1/provider/f9badd80-ab76-11e2-9e96-0800200c9a66",
            },
          ],
        },
      };
      await component.onSubmit();

      httpMock
        .expectOne("https://demo.intelehealth.org/openmrs/ws/rest/v1/session")
        .flush(RESPONSE);

      expect(RESPONSE.authenticated).toBeTruthy(true);
      expect(navigateSpy).toHaveBeenCalledWith(["/home"]);
    });

    it("should call onSubmit with authenticated false", async () => {
      const snackbarSpy = spyOn(component.snackbar, "open");

      const RESPONSE = {
        authenticated: false,
      };

      await component.onSubmit();
      httpMock
        .expectOne("https://demo.intelehealth.org/openmrs/ws/rest/v1/session")
        .flush(RESPONSE);

      expect(RESPONSE.authenticated).toBe(false);
      expect(snackbarSpy).toHaveBeenCalledWith(
        "Username & Password doesn't match",
        null,
        { duration: 4000 }
      );
    });
  });
});
