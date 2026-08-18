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
