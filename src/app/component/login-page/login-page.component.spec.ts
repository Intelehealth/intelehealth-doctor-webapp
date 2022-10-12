import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { ComponentFixture, TestBed, getTestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "src/app/services/session.service";
import { LoginPageComponent } from "./login-page.component";
import { RouterTestingModule } from "@angular/router/testing";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { mockLoginData } from "src/app/component/mock-data/mock-data.login";

describe("LoginPageComponent", () => {
  let component: LoginPageComponent;
  let sessionService: SessionService;
  let authService: AuthService;
  let snackbar: MatSnackBar;
  let fixture: ComponentFixture<LoginPageComponent>;
  let injector: TestBed;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
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
      component.ngOnInit();

      expect(authService.isLoggedIn()).toBeTruthy(true);
      expect(navigateSpy).toHaveBeenCalledWith("/home");
    });

    it("should call ngOnInit with isLoggedIn false", async () => {
      authService.isLoggedIn = () => false;

      component.ngOnInit();
      expect(authService.isLoggedIn()).toBeFalsy(false);
    });
  });

  describe("onSubmit", () => {
    it("should call onSubmit with authenticated true", async () => {
      const navigateSpy = spyOn(component.router, "navigate");
      const RESPONSEDATA = mockLoginData.SESSION_RESPONSE;

      component.onSubmit();

      httpMock
        .expectOne("https://demo.intelehealth.org/openmrs/ws/rest/v1/session")
        .flush(RESPONSEDATA);

      expect(RESPONSEDATA.authenticated).toBeTruthy(true);
      expect(navigateSpy).toHaveBeenCalledWith(["/home"]);
    });

    it("should call onSubmit with authenticated false", async () => {
      const snackbarSpy = spyOn(component.snackbar, "open");

      const RESPONSE = {
        authenticated: false,
      };

      component.onSubmit();
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

  describe("logOut", () => {
    it("should call logOut ", async () => {
      const navigateSpy = spyOn(component.router, "navigate");
      component.authService.logout();
      const DELET_RESPONSE = mockLoginData.DELET_RESPONSE;

      httpMock
        .expectOne("https://demo.intelehealth.org/openmrs/ws/rest/v1/session")
        .flush(DELET_RESPONSE);

      httpMock
        .expectOne("https://demo.intelehealth.org/openmrs/ws/rest/v1/session")
        .flush(DELET_RESPONSE);

      expect(navigateSpy).toHaveBeenCalledWith(["/"]);
    });
  });

  describe("provider", () => {
    it("should call provider for session service ", async () => {
      const userId = "a4ac4fee-538f-11e6-9cfe-86f436325720";
      component.sessionService.provider(userId);
    });
  });
});
