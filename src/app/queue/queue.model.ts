export type QueueStatus = 'on_call' | 'assigned' | 'awaiting_prescription' | 'next_in_queue' | 'waiting' | 'completed' | 'cancelled';

export interface QueuePatient {
  queueEntryId: number;
  visitUuid: string;
  patientUuid: string;
  name: string;
  gender: 'M' | 'F' | 'O';
  age: string;
  status: QueueStatus;
  hw: string;
  location: string;
  chiefComplaint: string;
  loaded?: boolean;
}

export type QueueEntryStatus = 'QUEUED' | 'RE_QUEUED' | 'ESCALATED' | 'ASSIGNED'
  | 'CALL_CONNECTING' | 'CALL_CONNECTED' | 'CALL_COMPLETED' | 'COMPLETED' | 'CANCELLED';

export interface QueueVisitEntry {
  queueEntryId: number;
  visitUuid: string;
  patientUuid: string;
  hwUserUuid: string;
  locationUuid: string;
  speciality: string;
  status: QueueEntryStatus;
  emergencyLevel: string;
  caseType: string;
  flagged: boolean;
  escalated: boolean;
  escalatedAt: string | null;
  position: number | null;
  waitedMinutes: number;
  etaAt: string | null;
  etaMinutes: number | null;
  etaOverdue: boolean;
  etaModelUsed: string | null;
  assignedDoctorUuid: string | null;
  heartbeatStale: boolean;
  prescriptionPending: boolean;
  prescriptionOutstandingMinutes: number | null;
  prescriptionOverdue: boolean;
  queuedAt: string | null;
  assignedAt: string | null;
  connectedAt: string | null;
  completedAt: string | null;
}

export interface QueueVisitsData {
  currentVisit: QueueVisitEntry | null;
  items: QueueVisitEntry[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  doctorUuid: string;
  speciality: string;
}

export interface QueueVisitsResponse {
  success: boolean;
  message: string;
  data: QueueVisitsData;
}

export type DoctorStatus = 'online' | 'away' | 'offline';

export interface DoctorStatusData {
  doctorUuid: string;
  status: DoctorStatus;
  speciality: string;
  currentQueueEntryId: number | null;
  lastChangedAt: string;
  requestedStatus: DoctorStatus;
  heldInConsult: boolean;
  dispatched: { queueEntryId: number; doctorUuid: string }[];
}

export interface DoctorStatusResponse {
  success: boolean;
  message: string;
  data: DoctorStatusData;
}

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
  assigned: 'Assigned',
  awaiting_prescription: 'Awaiting Prescription',
  next_in_queue: 'Next in Queue',
  waiting: 'Waiting',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

