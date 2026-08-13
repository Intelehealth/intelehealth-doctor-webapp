import { facility, refer_prioritie } from 'src/config/constant';
import medicines from 'src/app/core/data/medicines';
import doses from 'src/app/core/data/dose';
import durationUnits from 'src/app/core/data/durationUnitList';
import instructionRemarks from 'src/app/core/data/instructionRemarks';
import { AdviceBundle, AiDiagnosisSuggestion, AiMedicationSuggestion, AyuSuggestedQuestion } from '../visit-summary-v2.models';

export const AI_SUGGESTION_DELAY_MS = 1500;
export const DIAGNOSIS_SEARCH_DEBOUNCE_MS = 300;
export const DIAGNOSIS_SEARCH_MIN_LENGTH = 3;
export const DEFAULT_DIAGNOSIS_CODE = 'NA';
export const DEFAULT_DIAGNOSIS_TYPE = 'Primary';
export const DEFAULT_DIAGNOSIS_STATUS = 'Provisional';
export const DEFAULT_MEDICINE_DURATION_UNIT = 'Days';

export const CONTEXT_CHIPS: string[] = ['Pregnancy', 'Travel History', 'Immunocompromised', 'Weight Loss', 'Chronic Disease'];
export const DIAGNOSIS_TYPES: string[] = ['Primary', 'Secondary'];
export const DIAGNOSIS_STATUSES: string[] = ['Provisional', 'Confirmed', 'Under Evaluation'];
export const QUICK_DIAGNOSES: string[] = ['Viral Fever', 'Hypertension', 'UTI', 'Diabetes', 'Pregnancy'];

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
export const QUICK_MEDICINES: string[] = ['Paracetamol', 'Lisinopril', 'Nitrofurantoin', 'Metformin', 'Prenatal vitamins'];
export const TIMING_OPTIONS: string[] = ['1 - 0 - 0', '0 - 1 - 0', '0 - 0 - 1', '1 - 0 - 1', '1 - 1 - 1'];
export const DAY_OPTIONS: string[] = ['3', '5', '7', '10', '15', '30'];

export const QUICK_ADVICES: string[] = ['Light Exercise', 'Drink 2-3 liters of water', 'Use Lukewarm water', 'Follow up in 7 days'];

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

export const DEFAULT_AI_CLINICAL_SUMMARY = 'The most likely diagnoses for this patient are Urinary Tract Infection (UTI), Viral Fever, and Anemia, given the symptoms of burning sensation during urination, prolonged fever with chills and night sweats, and signs of anemia like pale pallor and pale nails. These conditions are common in rural India and can be managed with appropriate treatment. The presence of significant vital sign abnormalities suggests the need for further evaluation.';

export const DEFAULT_AI_DIAGNOSIS_SUGGESTIONS: AiDiagnosisSuggestion[] = [
  { name: 'Dengue', likelihood: 'High', reasons: ['Fever for 3 days', 'Body Ache Reported', 'Elevated Temperature (102 °F)'] },
  { name: 'Viral Fever', likelihood: 'High', reasons: ['Fever for 3 days', 'Body Ache Reported', 'Elevated Temperature (102 °F)'] },
  { name: 'URI', likelihood: 'Moderate', reasons: ['Sore throat reported', 'Nasal congestion'] },
  { name: 'Malaria', likelihood: 'Less', reasons: ['Fever with chills', 'Endemic area'] },
  { name: 'Typhiod', likelihood: 'Less', reasons: ['Prolonged fever', 'Abdominal discomfort'] }
];

export const DEFAULT_AI_MEDICATION_SUGGESTIONS: AiMedicationSuggestion[] = [
  { name: 'Cetirizine', label: 'Cetirizine 100mg', likelihood: 'High', reasons: ['Fast relief from allergy symptoms.', 'Non-drowsy formula', 'Suitable for daily use'] },
  { name: 'Zylip 150mg', label: 'Zylip 150mg', likelihood: 'High', reasons: ['Matches the suggested diagnosis', 'Well tolerated at this dose'] },
  { name: 'Azicip 500mg', label: 'Azicip 500mg', likelihood: 'Moderate', reasons: ['Covers likely bacterial cause', 'Short course option'] },
  { name: 'Dolo 500mg', label: 'Dolo 500mg', likelihood: 'Less', reasons: ['Symptomatic fever relief only'] }
];

export const DEFAULT_AYU_SUGGESTED_QUESTIONS: AyuSuggestedQuestion[] = [
  { category: 'Symptom Timing', question: 'Does the patient experience headaches more in the morning or evening?', answer: 'No' },
  { category: 'Associated Symptoms', question: 'Is there any visual disturbance (blurred vision, seeing spots)?', answer: 'Seeing Spots', editing: true },
  { category: 'Clinical Signs', question: 'Has the patient noticed sudden weight gain in the past week?', answer: '' }
];
