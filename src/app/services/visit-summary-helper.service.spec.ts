import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { EncounterModel } from '../model/model';
import { VisitService } from './visit.service';
import { VisitSummaryHelperService } from './visit-summary-helper.service';

describe('VisitSummaryHelperService - visit in progress with another doctor', () => {
  let service: VisitSummaryHelperService;

  const noteWith = (...providers: any[]): EncounterModel =>
    ({ encounterProviders: providers } as unknown as EncounterModel);

  beforeEach(() => {
    service = new VisitSummaryHelperService({} as HttpClient, {} as VisitService, {} as TranslateService);
  });

  describe('getVisitNoteDoctorName', () => {
    it('returns an empty string when there is no visit note', () => {
      expect(service.getVisitNoteDoctorName(undefined)).toBe('');
    });

    it('returns an empty string when the visit note has no encounter providers', () => {
      expect(service.getVisitNoteDoctorName({} as EncounterModel)).toBe('');
      expect(service.getVisitNoteDoctorName(noteWith())).toBe('');
    });

    it('uses the provider person display name', () => {
      const note = noteWith({ display: 'Jane Doe: Doctor', provider: { person: { display: 'Jane Doe' } } });
      expect(service.getVisitNoteDoctorName(note)).toBe('Jane Doe');
    });

    it('strips a leading "Dr." / "Dr" prefix so the message does not read "Dr. Dr. Name"', () => {
      expect(service.getVisitNoteDoctorName(noteWith({ provider: { person: { display: 'Dr. Jane Doe' } } }))).toBe('Jane Doe');
      expect(service.getVisitNoteDoctorName(noteWith({ provider: { person: { display: 'dr Jane Doe' } } }))).toBe('Jane Doe');
    });

    it('does not strip a name that merely starts with the letters "Dr"', () => {
      expect(service.getVisitNoteDoctorName(noteWith({ provider: { person: { display: 'Drew Barry' } } }))).toBe('Drew Barry');
    });

    it('trims surrounding whitespace', () => {
      expect(service.getVisitNoteDoctorName(noteWith({ provider: { person: { display: '  Dr. Jane Doe  ' } } }))).toBe('Jane Doe');
    });

    it('falls back to the encounter provider display without the role suffix', () => {
      expect(service.getVisitNoteDoctorName(noteWith({ display: 'Jane Doe: Doctor', provider: { uuid: 'p1' } }))).toBe('Jane Doe');
    });

    it('does not use the provider display, which is "<identifier> - <name>"', () => {
      const note = noteWith({ provider: { uuid: 'p1', display: 'doc123 - Jane Doe' } });
      expect(service.getVisitNoteDoctorName(note)).toBe('');
    });

    it('uses the first provider that has a name', () => {
      const note = noteWith(
        { provider: { uuid: 'p1' } },
        null,
        { provider: { person: { display: 'Second Doctor' } } },
        { provider: { person: { display: 'Third Doctor' } } }
      );
      expect(service.getVisitNoteDoctorName(note)).toBe('Second Doctor');
    });
  });

  describe('isVisitInProgressWithAnotherDoctor', () => {
    it('is true when a visit note was started by someone else and the doctor can be named', () => {
      expect(service.isVisitInProgressWithAnotherDoctor(true, false, false, 'Jane Doe')).toBeTrue();
    });

    it('is false when there is no visit note', () => {
      expect(service.isVisitInProgressWithAnotherDoctor(false, false, false, 'Jane Doe')).toBeFalse();
    });

    it('is false for the doctor who started the visit', () => {
      expect(service.isVisitInProgressWithAnotherDoctor(true, true, false, 'Jane Doe')).toBeFalse();
    });

    it('is false for MCC users', () => {
      expect(service.isVisitInProgressWithAnotherDoctor(true, false, true, 'Jane Doe')).toBeFalse();
    });

    it('is false when the doctor name is empty', () => {
      expect(service.isVisitInProgressWithAnotherDoctor(true, false, false, '')).toBeFalse();
    });
  });
});
