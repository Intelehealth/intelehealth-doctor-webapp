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
