import { VisitService } from './visit.service';

describe('VisitService', () => {
  let service: VisitService;

  beforeEach(() => {
    service = new VisitService({} as any);
  });

  describe('parseChiefComplaints', () => {
    it('returns the complaint titles', () => {
      const value = '►Fever<b>Fever</b>Duration 2 days<b>Cough</b>Dry';

      expect(service.parseChiefComplaints(value)).toEqual(['Fever', 'Cough']);
    });

    it('strips the leading marker the dashboard also strips', () => {
      expect(service.parseChiefComplaints('►<b>►Fever</b>')).toEqual(['Fever']);
    });

    it('drops the text before the first complaint', () => {
      expect(service.parseChiefComplaints('Patient reports<b>Fever</b>')).toEqual(['Fever']);
    });

    it('leaves out associated symptoms', () => {
      const value = '<b>Fever</b>x<b>Associated symptoms</b>Cough';

      expect(service.parseChiefComplaints(value)).toEqual(['Fever']);
    });

    it('keeps a single-character complaint', () => {
      expect(service.parseChiefComplaints('<b>A</b>')).toEqual(['A']);
    });

    it('trims the surrounding spaces', () => {
      expect(service.parseChiefComplaints('<b>  Fever  </b>')).toEqual(['Fever']);
    });

    it('returns nothing for an empty or missing value', () => {
      expect(service.parseChiefComplaints('')).toEqual([]);
      expect(service.parseChiefComplaints(null)).toEqual([]);
      expect(service.parseChiefComplaints(undefined)).toEqual([]);
    });

    it('returns nothing when there is no complaint markup', () => {
      expect(service.parseChiefComplaints('no markup here')).toEqual([]);
    });
  });
});
