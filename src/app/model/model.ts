export interface LoginResponseModel {
  authenticated: boolean,
  sessionId: string,
  verified?: boolean,
  locale: string,
  currentProvider: {
    display: string,
    uuid: string
  },
  user: UserModel
}

export interface UserModel {
  uuid: string,
  username: string,
  display: string,
  systemId: string,
  person: {
    display: string,
    uuid: string
  },
  roles: RolesModel[],
  privileges: PrivilegesModel[]
}

export interface RolesModel {
  display: string,
  name: string,
  uuid: string
}

export interface PrivilegesModel {
  display: string,
  name: string,
  uuid: string
}

export interface AuthGatewayLoginResponseModel {
  status: boolean,
  token: string
}

export interface ProviderResponseModel {
  results: ProviderModel[]
}

export interface ProviderAttributeTypesResponseModel {
  results: ProviderAttributeTypeModel[]
}

export interface ObsApiResponseModel {
  results: ObsModel[]
}

export interface ProviderAttributeTypeModel {
  uuid: string,
  display: string
}

export interface ProviderModel {
  uuid: string,
  attributes?: ProviderAttributeModel[],
  person?: {
    age: number,
    birthdate: string,
    display: string,
    gender: string,
    uuid: string,
    preferredName: {
      display: string,
      familyName: string,
      givenName: string,
      middleName: string,
      uuid: string,
      voided: boolean
    }
  }
}

export interface CheckSessionResponseModel {
  rememberme: boolean
}

export interface RequestOtpModel {
  otpFor?: string,
  phoneNumber?: string,
  countryCode?: string,
  email?: string,
  username?: string
}

export interface RequestOtpResponseModel {
  success: boolean,
  message: string,
  data?: {
    userUuid: string
  }
}

export interface VerifyOtpModel {
  verifyFor?: string,
  phoneNumber?: string,
  countryCode?: string,
  email?: string,
  username?: string,
  otp?: string
}

export interface VerifyOtpResponseModel {
  success: boolean,
  message: string
}

export interface ApiResponseModel {
  success?: boolean,
  status?: boolean,
  message?: string,
  data?: any,
  dates?: SlotModel[],
  totalCount?: number,
  rescheduledAppointments?: AppointmentModel[]
}

export interface SlideModel {
  img_url: string,
  title: string,
  description: string,
  heartbeat1: string,
  heartbeat2: string
}

export interface DataItemModel {
  id: number,
  name: string,
  code?: string,
  text?: string,
  shortName?: string
}

export interface MindmapKeyModel {
  expiry: string,
  imageName: string,
  imageValue: string,
  keyName: string
}

export interface MindmapModel {
  createdAt: string,
  id: number,
  isActive: boolean,
  json: string,
  keyName: string,
  name: string,
  updatedAt: string
}

export interface UploadMindmapResponseModel {
  filename: string,
  value: string,
  key?: string
}

export interface ConversationModel {
  createdAt: string,
  doctorName: string,
  from: string,
  id: number,
  personUuid: string,
  unread: number,
  userUuid: string,
  message?: string,
  patientName?: string,
  patientId?: string,
  visitId?: string,
  fromUser?: string,
  toUser?: string,
  latestMessage?: string,
  messages?: MessageModel[],
  hwName?: string,
  patientPic?: string,
  openMrsId?: string
}

export interface MessageModel {
  createdAt?: string,
  from?: string,
  id?: number,
  isRead?: boolean,
  message?: string,
  to?: string,
  type?: string,
  me?: boolean,
  fromUser?: string
}

export interface AppointmentModel {
  createdAt: string,
  drName: string,
  hwAge: string,
  hwGender: string,
  hwName: string,
  hwPic?: string,
  hwUuid: string,
  id: number,
  locationUuid: string,
  openMrsId: string,
  patientAge: string,
  patientGender: string,
  patientId: string,
  patientName: string,
  patientPic?: string,
  reason?: string,
  slotDate: string,
  slotDay: string,
  slotDuration: any,
  slotDurationUnit: string,
  slotJsDate: string,
  slotTime: string|SlotModel,
  speciality: string,
  status: string,
  type: string,
  updatedAt: string,
  userUuid: string,
  visitUuid: string,
  visit: CustomVisitModel,
  visitStatus: string,
  cheif_complaint?: string[],
  starts_in?: string,
  appointmentId?: number
}

export interface CustomVisitModel {
  uuid: string,
  encounters: CustomEncounterModel[],
  location?: {
    name: string
  },
  patient?: {
    identifier?: string
  },
  patient_name?: {
    family_name?: string,
    given_name?: string
  },
  person?: {
    birthdate?: string,
    gender?: string,
    uuid?: string
  }
}

export interface CustomEncounterModel {
  encounter_datetime: string,
  encounter_provider?: CustomEncounterProviderModel,
  obs: CustomObsModel[],
  type?: {
    name?: string
  }
}

export interface CustomObsModel {
  value_text?: string,
  concept_id?: number,
  value_numeric?: number
}

export interface CustomEncounterProviderModel {
  uuid?: string,
  provider?: {
    identifier?: string,
    uuid?: string,
    person?: {
      uuid?: string,
      gender?: string,
      person_name?: {
        family_name?: string,
        given_name?: string
      }
    }
  }
}

export interface SlotModel {
  slotTime: string,

}

export interface RescheduleAppointmentModalResponseModel {
  date: string,
  slot: SlotModel
}

export interface ScheduleDataModel {
  morning: string[],
  afternoon: string[],
  evening: string[]
}

export interface ProviderAttributeModel {
  uuid: string,
  voided?: boolean,
  value: string,
  display?: string,
  attributeType?: {
    uuid: string,
    display: string
  }
}

export interface PatientVisitsModel {
  createdAt?: string,
  visitId: string
}

export interface SerachPatientApiResponseModel {
  results: PatientModel[]
}

export interface RecentVisitsApiResponseModel {
  results: VisitModel[]
}

export interface PatientModel {
  uuid: string,
  identifiers: PatientIdentifierModel[],
  attributes?: PersonAttributeModel[],
  person: {
    uuid?: string,
    age?: number,
    birthdate?: string,
    display?: string,
    gender?: string,
    attributes?: PersonAttributeModel[],
    preferredAddress?: {
      cityVillage?: string
    }
  }
}

export interface PatientIdentifierModel {
  identifier: string,
  identifierType: {
    name: string
    display?: string,
  }
}

export interface PersonAttributeModel {
  uuid: string,
  display?: string,
  attributeType?: {
    uuid: string,
    display: string
  },
  value?: any
}

export interface BreadcrumbModel {
  label: string,
  url: string
}

export interface FollowUpModel {
  visit_id?: string,
  followup_text?: string
}

export interface EncounterModel {
  uuid?: string
  display?: string,
  encounterDatetime?: string,
  encounterProviders?: EncounterProviderModel[],
  encounterType?: {
    display?: string
  },
  obs: ObsModel[]
}

export interface EncounterProviderModel {
  display?: string,
  provider?: ProviderModel
}

export interface ObsModel {
  uuid?: string,
  display?: string,
  value?: any,
  concept?: {
    uuid?: string,
    display?: string
  },
  encounter?: {
    visit?: {
      uuid?: string
    }
  }
  comment?:string
}

export interface ScheduleModel {
  type?: string,
  month: string,
  year: string,
  daysOff: string[],
  slotSchedule: ScheduleSlotModel[],
  startDate: string,
  endDate: string,
  drName?: string,
  userUuid?: string,
  speciality?: string,
  slotDays: string,
  createdAt?: string,
  updatedAt?: string,
  id?: number,
  added?: boolean,
  timings?: any
}

export interface ScheduleSlotModel {
  id?: string,
  startTime: string,
  endTime: string,
  day?: string,
  date?: string
}

export interface AppointmentDetailResponseModel {
  markAs: string,
  from: string,
  to: string
}

export interface ScheduledMonthModel {
  name: string,
  year: string
}

export interface VisitModel {
  uuid: string,
  attributes?: VisitAttributeModel[],
  display?: string,
  encounters?: EncounterModel[],
  location?: {
    display?: string
  },
  patient?: PatientModel,
  startDatetime?: string,
  stopDatetime?: string,
  doctor?: any,
  created_on?: string,
  cheif_complaint?: string[],
  prescription_sent?: string,
  visitUploadTime?: string,
  dateCreated?: string
}

export interface VisitAttributeModel {
  uuid: string,
  voided?: boolean,
  value?: any,
  display?: string,
  attributeType?: {
    uuid?: string,
    display?: string
  }
}

export interface ReferralModel {
  uuid?: string,
  speciality?: string,
  facility?: string,
  priority?: string,
  reason?: string
}

export interface TestModel {
  uuid?: string,
  value?: string
}

export interface MedicineModel {
  drug?: string,
  strength?: string,
  days?: string,
  timing?: string,
  remark?: string,
  uuid?: string
}

export interface PatientHistoryModel {
  title?: string,
  data?: KeyValueModel[]
}

export interface KeyValueModel {
  key?: string,
  value?: any
}

export interface DiagnosisModel {
  diagnosisName?: string,
  diagnosisType?: string,
  diagnosisStatus?: string,
  uuid?: string
}

export interface DocImagesModel {
  src: string,
  section: string,
  base64?: string
}

export interface SocketUserModel {
  callStatus?: string,
  name?: string,
  socketId: string,
  status?: string,
  uuid: string
}

export interface LivekitTokenModel {
  token: string,
  appToken: string
}

export interface FollowUpDataModel {
  present?: boolean,
  wantFollowUp?: string,
  followUpDate?: string,
  followUpTime?: string,
  followUpReason?: string
}

export interface HwModel {
  hwName: string,
  hwAge: number,
  hwGender: string,
  hwProviderUuid: string
}