export const REFERRAL_DECISION_NAMCO = 'NAMCO';
export const REFERRAL_DECISION_PHC = 'PHC';
export const REFERRAL_DECISION_NONE = 'No referral';

export const REFERRAL_DECISIONS: { value: string; label: string }[] = [
  { value: REFERRAL_DECISION_NAMCO, label: 'Refer to Namco' },
  { value: REFERRAL_DECISION_PHC, label: 'Refer to PHC' },
  { value: REFERRAL_DECISION_NONE, label: 'No referral needed' }
];

export const REFERRAL_CONSENT_YES = 'Yes';
export const REFERRAL_CONSENT_NO = 'No';
export const REFERRAL_CONSENT_OPTIONS: string[] = [REFERRAL_CONSENT_YES, REFERRAL_CONSENT_NO];

const NAMCO_PREFIX = 'namco';
const NAMCO_FACILITY = 'namco hospital';

/** Whether the given speciality name is a NAMCO doctor/specialization. */
export function isNamcoSpeciality(speciality: string | undefined | null): boolean {
  return (speciality || '').trim().toLowerCase().startsWith(NAMCO_PREFIX);
}

/** Whether the given facility name is the NAMCO Hospital facility. */
export function isNamcoFacility(facility: string | undefined | null): boolean {
  return (facility || '').trim().toLowerCase() === NAMCO_FACILITY;
}

/** Whether a referral targets NAMCO — i.e. would become "the" NAMCO referral for this visit. */
export function isNamcoReferralTarget(speciality: string | undefined | null, facility: string | undefined | null): boolean {
  return isNamcoSpeciality(speciality) && isNamcoFacility(facility);
}
