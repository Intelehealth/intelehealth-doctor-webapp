import { PatientModel } from '../model/model';
import { getPatientDisplayId } from './utility-functions';

describe('getPatientDisplayId', () => {
  const tmh = (value: any) => ({ attributeType: { display: 'TMH Case Number' }, value });
  const openMrsId = { identifierType: { display: 'OpenMRS ID' }, identifier: '16RGJ-8' };
  const abhaId = { identifierType: { display: 'ABHA Number' }, identifier: '91-1234' };
  const patient = (attributes: any[], identifiers: any[]) => ({ person: { attributes }, identifiers } as unknown as PatientModel);

  it('shows the TMH Case Number, labelled as such, when the patient has one', () => {
    expect(getPatientDisplayId(patient([tmh('TMH-123')], [openMrsId]))).toEqual({ id: 'TMH-123', label: 'TMH Case Number' });
  });

  it('falls back to the OpenMRS ID, labelled as such, when there is no TMH Case Number', () => {
    expect(getPatientDisplayId(patient([], [openMrsId]))).toEqual({ id: '16RGJ-8', label: 'OpenMRS ID' });
  });

  it('treats an empty or "NA" TMH Case Number as missing', () => {
    expect(getPatientDisplayId(patient([tmh('')], [openMrsId])).id).toBe('16RGJ-8');
    expect(getPatientDisplayId(patient([tmh('NA')], [openMrsId])).id).toBe('16RGJ-8');
    expect(getPatientDisplayId(patient([tmh(undefined)], [openMrsId])).id).toBe('16RGJ-8');
  });

  it('ignores other attributes', () => {
    const other = { attributeType: { display: 'Telephone Number' }, value: '999' };

    expect(getPatientDisplayId(patient([other], [openMrsId])).id).toBe('16RGJ-8');
  });

  it('never shows an identifier of another type under the "OpenMRS ID" label', () => {
    expect(getPatientDisplayId(patient([], [abhaId]))).toEqual({ id: '', label: 'TMH Case Number' });
  });

  it('prefers the typed OpenMRS ID over other identifiers', () => {
    expect(getPatientDisplayId(patient([], [abhaId, openMrsId])).id).toBe('16RGJ-8');
  });

  it('uses an identifier that has no type when the server did not return identifier type names', () => {
    expect(getPatientDisplayId(patient([], [{ identifier: 'UNTYPED-1' }]))).toEqual({ id: 'UNTYPED-1', label: 'OpenMRS ID' });
  });

  it('prefers the typed OpenMRS ID over an untyped identifier', () => {
    expect(getPatientDisplayId(patient([], [{ identifier: 'UNTYPED-1' }, openMrsId])).id).toBe('16RGJ-8');
  });

  it('returns an empty id, under the TMH label, when the patient has neither ID, so each screen shows its own "NA"', () => {
    expect(getPatientDisplayId(patient([], []))).toEqual({ id: '', label: 'TMH Case Number' });
  });

  it('does not break on a missing patient, missing lists or an attribute without a type', () => {
    expect(getPatientDisplayId(undefined).id).toBe('');
    expect(getPatientDisplayId({} as PatientModel).id).toBe('');
    expect(getPatientDisplayId(patient([{ value: 'orphan' }], [openMrsId])).id).toBe('16RGJ-8');
  });
});
import { isNamcoDoctor } from './utility-functions';

describe('isNamcoDoctor', () => {
  const SPECIALIZATION_ATTRIBUTE_TYPE_UUID = 'ed1715f5-93e2-404e-b3c9-2a2d9600f062';

  it('returns false for a regular doctor with no Namco signal', () => {
    const provider = {
      person: { display: 'Dr. Jane Doe' },
      attributes: [
        { uuid: 'attr-1', attributeType: { uuid: SPECIALIZATION_ATTRIBUTE_TYPE_UUID, display: 'specialization' }, value: 'General Physician', voided: false },
      ],
    };
    expect(isNamcoDoctor(provider)).toBe(false);
  });

  it('returns true when the doctor display name contains "Namco"', () => {
    const provider = {
      person: { display: 'Dr. John Smith (Namco Dermatology)' },
      attributes: [],
    };
    expect(isNamcoDoctor(provider)).toBe(true);
  });

  it('returns true when the specialization provider attribute starts with "Namco"', () => {
    const provider = {
      person: { display: 'Dr. Jane Doe' },
      attributes: [
        { uuid: 'attr-1', attributeType: { uuid: SPECIALIZATION_ATTRIBUTE_TYPE_UUID, display: 'specialization' }, value: 'Namco_Orthopaedic', voided: false },
      ],
    };
    expect(isNamcoDoctor(provider)).toBe(true);
  });

  it('ignores a voided specialization attribute', () => {
    const provider = {
      person: { display: 'Dr. Jane Doe' },
      attributes: [
        { uuid: 'attr-1', attributeType: { uuid: SPECIALIZATION_ATTRIBUTE_TYPE_UUID, display: 'specialization' }, value: 'Namco_Orthopaedic', voided: true },
      ],
    };
    expect(isNamcoDoctor(provider)).toBe(false);
  });

  it('handles a missing/undefined provider without throwing', () => {
    expect(isNamcoDoctor(undefined)).toBe(false);
  });
});
