import { hasTmhCaseNumber, pickPatientDisplayId } from './utility-functions';

describe('pickPatientDisplayId', () => {
  it('returns the TMH Case Number when there is one', () => {
    expect(pickPatientDisplayId('TMH-123', '16RGJ-8')).toBe('TMH-123');
  });

  it('falls back to the OpenMRS ID when the TMH Case Number is the default "NA"', () => {
    expect(pickPatientDisplayId('NA', '16RGJ-8')).toBe('16RGJ-8');
  });

  it('falls back to the OpenMRS ID when the TMH Case Number is empty or missing', () => {
    expect(pickPatientDisplayId('', '16RGJ-8')).toBe('16RGJ-8');
    expect(pickPatientDisplayId(undefined, '16RGJ-8')).toBe('16RGJ-8');
  });

  it('keeps showing "NA" when the patient has neither ID', () => {
    expect(pickPatientDisplayId('NA', '')).toBe('NA');
  });

  it('uses the screen\'s own "not available" text, which can be translated', () => {
    expect(pickPatientDisplayId('लागू नहीं', '16RGJ-8', 'लागू नहीं')).toBe('16RGJ-8');
    expect(pickPatientDisplayId('TMH-123', '16RGJ-8', 'लागू नहीं')).toBe('TMH-123');
  });
});

describe('hasTmhCaseNumber', () => {
  it('is true for a real case number', () => {
    expect(hasTmhCaseNumber('TMH-123')).toBeTrue();
  });

  it('is false for the default "NA", an empty value or a missing value', () => {
    expect(hasTmhCaseNumber('NA')).toBeFalse();
    expect(hasTmhCaseNumber('')).toBeFalse();
    expect(hasTmhCaseNumber(undefined)).toBeFalse();
  });

  it('compares with the "not available" text of the screen', () => {
    expect(hasTmhCaseNumber('लागू नहीं', 'लागू नहीं')).toBeFalse();
    expect(hasTmhCaseNumber('NA', 'लागू नहीं')).toBeTrue();
  });
});
