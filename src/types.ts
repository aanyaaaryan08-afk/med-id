export type PageId =
  | 'dashboard'
  | 'emergency'
  | 'timeline'
  | 'consultations'
  | 'medications'
  | 'records'
  | 'doctor-access'
  | 'bracelet';

export interface Patient {
  name: string;
  medId: string;
  dob: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  personalPhone: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  lastConsultation: string;
  photoColor: string;
}

export interface Allergy {
  id: string;
  name: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  reaction: string;
}

export interface MedicalCondition {
  id: string;
  name: string;
  diagnosedDate: string;
  status: 'Active' | 'Managed' | 'Resolved';
  notes: string;
}

export interface Surgery {
  id: string;
  name: string;
  date: string;
  hospital: string;
  surgeon: string;
  outcome: string;
}

export interface Test {
  id: string;
  name: string;
  date: string;
  type: string;
  result: string;
  status: 'Normal' | 'Abnormal' | 'Pending';
}

export interface Vaccination {
  id: string;
  name: string;
  date: string;
  dose: string;
  nextDue: string;
}

export interface FamilyHistory {
  id: string;
  relation: string;
  condition: string;
  notes: string;
}

export interface Medication {
  id: string;
  name: string;
  reason: string;
  prescribedBy: string;
  date: string;
  duration: string;
  status: 'Current' | 'Completed' | 'Discontinued';
  dosage: string;
}

export interface Consultation {
  id: string;
  date: string;
  doctor: string;
  specialization: string;
  reason: string;
  diagnosis: string;
  prescription: string;
  tests: string;
  notes: string;
  followUp: string;
}

export type ItemCategory =
  | 'imaging'
  | 'lab_test'
  | 'medication'
  | 'diagnosis'
  | 'condition'
  | 'allergy'
  | 'procedure'
  | 'vaccination'
  | 'recommendation'
  | 'follow_up'
  | 'other';

export interface ConsultationItem {
  id: string;
  consultationId: string;
  category: ItemCategory;
  name: string;
  details: string;
  date: string;
  doctor: string;
  status: string;
}

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  imaging: 'Imaging / Diagnostic Tests',
  lab_test: 'Blood / Laboratory Tests',
  medication: 'Medications',
  diagnosis: 'Diagnoses',
  condition: 'Conditions',
  allergy: 'Allergies',
  procedure: 'Procedures / Surgeries',
  vaccination: 'Vaccinations',
  recommendation: 'Recommendations',
  follow_up: 'Follow-ups',
  other: 'Other Medical Records',
};

export const CATEGORY_OPTIONS: { value: ItemCategory; label: string }[] = [
  { value: 'diagnosis', label: 'Diagnosis' },
  { value: 'condition', label: 'Condition' },
  { value: 'allergy', label: 'Allergy' },
  { value: 'medication', label: 'Medication' },
  { value: 'imaging', label: 'Imaging / Diagnostic Test' },
  { value: 'lab_test', label: 'Blood / Laboratory Test' },
  { value: 'procedure', label: 'Procedure / Surgery' },
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'recommendation', label: 'Recommendation' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'other', label: 'Other Medical Record' },
];
