import { of } from 'rxjs';
import { DoctorNoteComponent } from './doctor-note.component';
import { AYU_NOTE_PREFIX, VisitSummaryV2Service } from '../visit-summary-v2.service';

const VISIT = 'visit-1';
const obs = (uuid: string, value: string, visit = VISIT) => ({ uuid, value, encounter: { uuid: 'enc', visit: { uuid: visit } } });

function makeService(results: any[]): any {
  const svc: any = Object.create(VisitSummaryV2Service.prototype);
  svc.diagnosisService = { getObs: jasmine.createSpy('getObs').and.returnValue(of({ results })) };
  svc.encounterService = { updateObs: jasmine.createSpy('updateObs').and.returnValue(of({ uuid: 'u' })) };
  svc.postObs = jasmine.createSpy('postObs').and.returnValue(of({ uuid: 'u' }));
  return svc;
}

function makeComponent(v2: any, overrides: any = {}): any {
  const c: any = Object.create(DoctorNoteComponent.prototype);
  Object.assign(c, {
    v2Service: v2,
    patientUuid: 'p',
    visitNoteUuid: 'e',
    visitUuid: VISIT,
    visit: {},
    patientInfo: {},
    visitCompleted: false,
    outcomeNotes: [],
    ayuNoteValue: '',
    ayuSuggestedQuestions: [],
    ayuRefineText: ''
  }, overrides);
  c.loadAiDiagnosis = jasmine.createSpy('loadAiDiagnosis');
  return c;
}

describe('Doctor note DDx notes', () => {
  describe('service', () => {
    it('saveInteractionNote writes the prefix', () => {
      const svc = makeService([]);
      svc.saveInteractionNote('p', 'e', 'a1', undefined).subscribe();
      expect(svc.postObs.calls.mostRecent().args[3]).toBe(`${AYU_NOTE_PREFIX}a1`);
      svc.saveInteractionNote('p', 'e', 'a2', 'x').subscribe();
      expect(svc.encounterService.updateObs.calls.mostRecent().args[1].value).toBe(`${AYU_NOTE_PREFIX}a2`);
    });

    it('loadInteractionNote picks only the latest prefixed obs and strips the prefix', done => {
      const svc = makeService([
        obs('1', `${AYU_NOTE_PREFIX}old`),
        obs('2', `${AYU_NOTE_PREFIX}new`),
        obs('3', 'plain outcome note'),
        obs('4', `${AYU_NOTE_PREFIX}other visit`, 'visit-2')
      ]);
      svc.loadInteractionNote('p', VISIT).subscribe((n: any) => {
        expect(n).toEqual({ value: 'new', uuid: '2' });
        done();
      });
    });

    it('loadInteractionNote ignores legacy un-prefixed notes', done => {
      const svc = makeService([obs('3', 'plain outcome note')]);
      svc.loadInteractionNote('p', VISIT).subscribe((n: any) => {
        expect(n).toEqual({ value: '', uuid: '' });
        done();
      });
    });

    it('draft notes exclude prefixed obs', done => {
      const svc = makeService([obs('1', `${AYU_NOTE_PREFIX}ayu`), obs('2', 'legacy note'), obs('3', 'outcome')]);
      svc.loadDraftNote('p', VISIT).subscribe((d: any) => {
        expect(d.notes.map((n: any) => n.value)).toEqual(['legacy note', 'outcome']);
        done();
      });
    });

    it('removeDraftItem calls the completion callback after delete', () => {
      const svc = makeService([]);
      svc.deleteObs = () => of({});
      const list = [{ uuid: 'a' }];
      const cb = jasmine.createSpy('cb');
      svc.removeDraftItem(list, 0, 'a', cb);
      expect(list.length).toBe(0);
      expect(cb).toHaveBeenCalled();
    });

    it('loadAiDiagnosis forces recompute with empty notes only when forced', () => {
      const svc = makeService([]);
      svc.aiddxService = {
        getDDxPayload: () => ({}),
        getAIDiagnosis: jasmine.createSpy('getAIDiagnosis').and.returnValue(of({}))
      };
      svc.loadAiDiagnosis({}, {}, '', false, true).subscribe();
      expect(svc.aiddxService.getAIDiagnosis.calls.mostRecent().args[3]).toBe(false);
      svc.loadAiDiagnosis({}, {}, '', false, true, true).subscribe();
      expect(svc.aiddxService.getAIDiagnosis.calls.mostRecent().args[3]).toBe(true);
    });
  });

  describe('component', () => {
    it('buildDdxNotes joins ayu and outcome notes, trimmed and non-empty', () => {
      const c = makeComponent({}, { ayuNoteValue: 'Q1 yes\nQ2 no', outcomeNotes: [{ value: ' n1 ' }, { value: '  ' }, { value: 'n2' }] });
      expect(c.buildDdxNotes()).toBe('Q1 yes\nQ2 no\nn1\nn2');
    });

    it('addNote re-runs DDx with all notes and recompute=true', () => {
      const v2 = { saveNote: () => of({ uuid: 'n' }) };
      const c = makeComponent(v2, { newNoteText: 'fresh', ayuNoteValue: 'ayu', outcomeNotes: [{ value: 'old' }] });
      c.addNote();
      expect(c.loadAiDiagnosis).toHaveBeenCalledWith('ayu\nold\nfresh', true, false);
    });

    it('deleteNote of the last note forces recompute with empty notes', () => {
      const v2 = {
        removeDraftItem: (list: any[], i: number, _u: string, cb: () => void) => { list.splice(i, 1); cb(); }
      };
      const c = makeComponent(v2, { outcomeNotes: [{ value: 'only', uuid: 'x' }] });
      c.deleteNote(0, 'x');
      expect(c.loadAiDiagnosis).toHaveBeenCalledWith('', true, true);
    });

    it('does not re-run DDx when the visit is completed', () => {
      const v2 = {
        saveNote: () => of({ uuid: 'n' }),
        removeDraftItem: (list: any[], i: number, _u: string, cb: () => void) => { list.splice(i, 1); cb(); }
      };
      const c = makeComponent(v2, { visitCompleted: true, newNoteText: 'x', outcomeNotes: [{ value: 'a', uuid: 'u' }] });
      c.addNote();
      c.deleteNote(0, 'u');
      expect(c.loadAiDiagnosis).not.toHaveBeenCalled();
    });

    it('does not re-run DDx when writing is not possible', () => {
      const v2 = { saveNote: () => of({ uuid: 'n' }) };
      const c = makeComponent(v2, { visitNoteUuid: '', newNoteText: 'x' });
      c.addNote();
      expect(c.loadAiDiagnosis).not.toHaveBeenCalled();
    });

    it('initial DDx waits for both the draft and the ayu note', () => {
      const c = makeComponent({}, { ayuNoteValue: 'ayu', outcomeNotes: [{ value: 'o' }] });
      c.draftLoaded = true;
      c.ayuLoaded = false;
      c.maybeLoadInitialDdx();
      expect(c.loadAiDiagnosis).not.toHaveBeenCalled();
      c.ayuLoaded = true;
      c.maybeLoadInitialDdx();
      expect(c.loadAiDiagnosis).toHaveBeenCalledWith('ayu\no');
    });
  });
});
