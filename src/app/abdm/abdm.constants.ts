/**
 * ABDM (Ayushman Bharat Digital Mission) M2 constants.
 * Keep every ABDM-specific UUID / key / label here so the rest of the app stays ABDM-agnostic.
 */

/** Health Information (HI) types a doctor can choose to push to ABDM for a visit. */
export enum AbdmHiType {
  OP_CONSULT_RECORD = 'OP Consult Record',
  WELLNESS_RECORD = 'Wellness Record',
  PRESCRIPTION_RECORD = 'Prescription Record',
  HEALTH_DOCUMENT = 'Health Document',
}

/** Visit attribute type UUIDs used by the ABDM flow. */
export const ABDM_VISIT_ATTRIBUTE_TYPES = {
  /** isABDMLinked - set to false when the care context is posted; backend flips it once linked. */
  IS_ABDM_LINKED: '8ac6b1c7-c781-494a-b4ef-fb7d7632874f',
  /** Display name of the visit attribute holding the ABHA address chosen for this visit. */
  ABHA_ADDRESS_ASSOCIATED: 'ABHA_ADDRESS_ASSOCIATED',
};

/** Patient identifier type display names (compared in lower case). */
export const ABHA_IDENTIFIER_TYPES = {
  ABHA_NUMBER: 'abha number',
  ABHA_ADDRESS: 'abha address',
};

/** Fallback ABHA address suffix used when the environment does not define `abhaAddressSuffix`. */
export const DEFAULT_ABHA_ADDRESS_SUFFIX = '@sbx';

/**
 * ABHA backend endpoints, relative to environment.abhaURL.
 * abhaURL already includes the `/abha` prefix (e.g. https://nasstaging.intelehealth.org/abha),
 * so do not repeat it here.
 */
export const ABDM_API = {
  POST_CARE_CONTEXT: '/post-care-context',
  VISIT_CARE_CONTEXT: '/visit/carecontext',
};
