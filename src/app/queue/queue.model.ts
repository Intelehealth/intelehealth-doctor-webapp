export type QueueStatus = 'on_call' | 'next_in_queue' | 'waiting' | 'completed';

export interface QueuePatient {
  visitUuid: string;
  patientUuid: string;
  name: string;
  gender: 'M' | 'F' | 'O';
  age: string;
  status: QueueStatus;
  hw: string;
  location: string;
  chiefComplaint: string;
}

export type DoctorAvailability = 'available' | 'on_break' | 'off_shift';

export const CALL_NOT_HAPPENED_REASONS: string[] = [
  'Async Consultation',
  'Follow-up Case',
  'Network Issue',
  'Healthworker Unavailable',
  'Patient Unavailable',
  'Other'
];

export const BREAK_PRESETS: number[] = [10, 20, 30];

export const QUEUE_STATUS_LABELS: Record<QueueStatus, string> = {
  on_call: 'On Call',
  next_in_queue: 'Next in Queue',
  waiting: 'Waiting',
  completed: 'Completed'
};
