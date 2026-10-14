import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ConfigService } from 'src/app/services/config.service';
import { LanguageFieldUpdate } from './language-fields-update.component';

describe('LanguageFieldUpdate', () => {
  let component: LanguageFieldUpdate;
  let fixture: ComponentFixture<LanguageFieldUpdate>;

  const languages = [
    { code: 'en', name: 'English', is_default: true },
    { code: 'hi', name: 'Hindi', is_default: false }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LanguageFieldUpdate],
      imports: [ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { fieldName: 'Name', fieldValue: { en: 'Hello' } } },
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: ConfigService, useValue: { getAppLanguages: () => of({ languages }) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageFieldUpdate);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.fieldName).toBe('Name');
  });

  it('builds one field per language, pre-filled with the existing values', fakeAsync(() => {
    fixture.detectChanges();
    tick(10);

    expect(component.fields.length).toBe(2);
    expect(component.fields.value).toEqual([
      { language: 'English', code: 'en', value: 'Hello' },
      { language: 'Hindi', code: 'hi', value: '' }
    ]);
  }));
});
