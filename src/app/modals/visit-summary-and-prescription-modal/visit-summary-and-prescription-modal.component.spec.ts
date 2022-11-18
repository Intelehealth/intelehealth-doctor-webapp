import { ComponentFixture, TestBed } from "@angular/core/testing";
import { VisitSummaryAndPrescriptionModalComponent } from "./visit-summary-and-prescription-modal.component";

describe("VisitSummaryAndPrescriptionModalComponent", () => {
  let component: VisitSummaryAndPrescriptionModalComponent;
  let fixture: ComponentFixture<VisitSummaryAndPrescriptionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VisitSummaryAndPrescriptionModalComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(
      VisitSummaryAndPrescriptionModalComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
