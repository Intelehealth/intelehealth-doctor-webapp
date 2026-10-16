export const SPECIALIST_DIAGNOSIS_STATUSES: string[] = ['Provisional', 'Confirmed'];

/** Follow-up type, as in the old Visit Summary. On a turn server it's always Telemedicine and not asked. */
export const FOLLOW_UP_TYPE_TELEMEDICINE = 'Telemedicine';
export const FOLLOW_UP_TYPES: string[] = ['In person', FOLLOW_UP_TYPE_TELEMEDICINE];

export const SPECIALIST_NOTE_TITLE = 'Specialist Doctor\'s Note';
export const PRIMARY_NOTE_TITLE = 'Primary Doctor\'s Note';
export const CURRENT_VISITS_TITLE = 'Current visits';
