import { facility, refer_prioritie } from 'src/config/constant';
import medicines from 'src/app/core/data/medicines';
import doses from 'src/app/core/data/dose';
import durationUnits from 'src/app/core/data/durationUnitList';
import instructionRemarks from 'src/app/core/data/instructionRemarks';
import { AdviceBundle } from '../visit-summary-v2.models';

export const DIAGNOSIS_SEARCH_DEBOUNCE_MS = 300;
export const DIAGNOSIS_SEARCH_MIN_LENGTH = 3;
export const DEFAULT_DIAGNOSIS_CODE = 'NA';
export const DEFAULT_DIAGNOSIS_TYPE = 'Primary';
export const DEFAULT_DIAGNOSIS_STATUS = 'Provisional';
export const DEFAULT_MEDICINE_DURATION_UNIT = 'Days';
export const MEDICINE_SEARCH_MIN_LENGTH = 2;
export const MEDICINE_SEARCH_MAX_RESULTS = 8;
export const ADVICE_SEARCH_MAX_RESULTS = 8;
export const ADVICE_SEARCH_MIN_LENGTH = 2;

export const CONTEXT_CHIPS: string[] = ['Pregnancy', 'Travel History', 'Immunocompromised', 'Weight Loss', 'Chronic Disease'];
export const DIAGNOSIS_TYPES: string[] = ['Primary', 'Secondary'];
export const DIAGNOSIS_STATUSES: string[] = ['Provisional', 'Confirmed', 'Under Evaluation'];

export const DRUG_OPTIONS: string[] = medicines.map(m => m.name);
export const DOSE_OPTIONS: string[] = doses.map(d => d.name);
export const DURATION_UNIT_OPTIONS: string[] = durationUnits.map(u => u.name);
export const INSTRUCTION_OPTIONS: string[] = instructionRemarks.map(i => i.name);
export const FACILITY_OPTIONS: string[] = facility.facilities.map(f => f.name);
export const REFERRAL_PRIORITIES: string[] = refer_prioritie.refer_priorities.map(p => p.name);

export const FREQUENCY_OPTIONS: string[] = [
  'Once daily', 'Twice daily', 'Three times daily', 'Four times daily',
  'Every 30 minutes', 'Every hour', 'Every four hours', 'Every eight hours',
  'Twice daily before meals', 'Twice daily after meals'
];
export const TIMING_OPTIONS: string[] = ['1 - 0 - 0', '0 - 1 - 0', '0 - 0 - 1', '1 - 0 - 1', '1 - 1 - 1'];
export const DAY_OPTIONS: string[] = ['3', '5', '7', '10', '15', '30'];

export const ADVICE_BUNDLES: AdviceBundle[] = [
  {
    name: 'Pregnancy',
    items: ['Daily fetal movement count', 'Take iron and calcium supplements regularly', 'Attend all scheduled ANC visits',
      'Stay hydrated', 'Avoid heavy lifting', 'Sleep on your left side', 'Report vaginal bleeding immediately']
  },
  {
    name: 'Hypertension',
    items: ['Monitor BP twice daily', 'Reduce salt intake', 'Avoid smoking and alcohol', 'Light exercise 30 min daily',
      'Take medication at same time daily']
  },
  {
    name: 'Fever',
    items: ['Drink 2-3 liters of fluids daily', 'Take complete bed rest for 3-5 days', 'Monitor temperature twice daily',
      'Use lukeward water', 'Return if fever exceeds 103°F']
  },
  {
    name: 'Diabetes',
    items: ['Monitor blood glucose daily', 'Avoid high-sugar foods', 'Walk 30 minutes daily after meals',
      'Maintain regular meal timing', 'Inspect feet daily for cuts']
  },
  {
    name: 'Lifestyle',
    items: ['Stay hydrated', 'Take adequate rest', 'Light exercise 30 min daily', 'Eat balanced diet', 'Get 7-8 hours sleep']
  },
  {
    name: 'Follow-up',
    items: ['Follow up in 5-7 days', 'Complete medication course', 'Report if symptoms worsen', 'Schedule next appointment']
  }
];


export const AI_CONFIDENCE_HIGH = 0.7;

export const AI_CONFIDENCE_MODERATE = 0.4;
