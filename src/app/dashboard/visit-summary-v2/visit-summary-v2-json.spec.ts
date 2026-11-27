import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AiddxService, AiTxService, CONFIG_SERVICE, ENVIRONMENT } from 'aiddx-library';
import { VisitSummaryV2Service } from './visit-summary-v2.service';

describe('VisitSummaryV2Service JSON visit summary payload', () => {
  const summary = { extraction: { demographic: { sex: 'F', age: 37 }, chief_complaint: [{ symptom: 'Diarrhea' }] } };
  const visit: any = {
    uuid: 'bf742d07-135c-43a3-86a4-b24fb937585c',
    encounters: [
      {
        display: 'ADULTINITIAL 01/01/2026',
        encounterType: { display: 'ADULTINITIAL' },
        obs: [
          { display: 'CURRENT COMPLAINT: x', value: 'x', concept: { uuid: 'c', display: 'CURRENT COMPLAINT' } },
          {
            display: 'JSON Format Visit Summary: ' + JSON.stringify(summary),
            value: JSON.stringify(summary),
            concept: { uuid: '1f770363-262e-4d01-b1df-3eb164d575ef', display: 'JSON Format Visit Summary' }
          }
        ]
      },
      { display: 'Vitals', encounterType: { display: 'Vitals' }, obs: [] }
    ]
  };
  const patientInfo: any = { person: { gender: 'F', age: 37 } };
  const config: any = { ai_llm: {} };
  let http: HttpTestingController;
  let v2: VisitSummaryV2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AiddxService,
        AiTxService,
        { provide: ENVIRONMENT, useValue: { mindmapURL: 'http://mm' } },
        { provide: CONFIG_SERVICE, useValue: config }
      ]
    });
    http = TestBed.inject(HttpTestingController);
    v2 = Object.assign(Object.create(VisitSummaryV2Service.prototype), {
      aiddxService: TestBed.inject(AiddxService),
      aiTxService: TestBed.inject(AiTxService)
    });
  });

  afterEach(() => http.verify());

  const cases = [
    { parent: false, ddx: true, ttx: true, ddxJson: false, ttxJson: false },
    { parent: true, ddx: false, ttx: false, ddxJson: false, ttxJson: false },
    { parent: true, ddx: true, ttx: false, ddxJson: true, ttxJson: false },
    { parent: true, ddx: false, ttx: true, ddxJson: false, ttxJson: true },
    { parent: true, ddx: true, ttx: true, ddxJson: true, ttxJson: true }
  ];

  cases.forEach(c => {
    it(`parent=${c.parent} ddx=${c.ddx} ttx=${c.ttx}`, () => {
      config.ai_llm = {
        json_format_visit_summary: c.parent,
        json_format_visit_summary_ddx: c.ddx,
        json_format_visit_summary_ttx: c.ttx
      };
      v2.loadAiDiagnosis(patientInfo, visit, 'doc notes').subscribe();
      const ddx = http.expectOne('http://mm/ddx').request.body;
      v2.loadAiTreatment(patientInfo, visit, 'Gastroenteritis').subscribe();
      const ttx = http.expectOne(r => r.url.startsWith('http://mm/ttx')).request.body;
      expect(typeof ddx.casehistory).toBe('string');
      expect(typeof ttx.case).toBe('string');
      if (c.ddxJson) {
        expect(JSON.parse(ddx.casehistory)).toEqual({ ...summary, notes: 'doc notes' });
      } else {
        expect(ddx.casehistory.startsWith('{')).toBeFalse();
      }
      if (c.ttxJson) {
        expect(JSON.parse(ttx.case)).toEqual(summary);
      } else {
        expect(ttx.case.startsWith('{')).toBeFalse();
      }
    });
  });

  it('falls back to the string payload when the visit has no JSON obs', () => {
    config.ai_llm = { json_format_visit_summary: true, json_format_visit_summary_ddx: true, json_format_visit_summary_ttx: true };
    const bare: any = { ...visit, encounters: [{ ...visit.encounters[0], obs: [visit.encounters[0].obs[0]] }, visit.encounters[1]] };
    v2.loadAiDiagnosis(patientInfo, bare, 'doc notes').subscribe();
    expect(http.expectOne('http://mm/ddx').request.body.casehistory.startsWith('{')).toBeFalse();
    v2.loadAiTreatment(patientInfo, bare, 'Gastroenteritis').subscribe();
    expect(http.expectOne(r => r.url.startsWith('http://mm/ttx')).request.body.case.startsWith('{')).toBeFalse();
  });
});
