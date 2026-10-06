import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { VisitService } from 'src/app/services/visit.service';
import { PastVisitHistoryComponent } from './past-visit-history.component';

describe('PastVisitHistoryComponent', () => {
  let component: PastVisitHistoryComponent;
  let fixture: ComponentFixture<PastVisitHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ RouterTestingModule ],
      declarations: [ PastVisitHistoryComponent ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { patientName: 'Test' } },
        { provide: VisitService, useValue: { recentVisits: () => of({ results: [] }) } },
        { provide: MatDialogRef, useValue: { close: () => {} } }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PastVisitHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
