import type {
  Patient,
  Allergy,
  MedicalCondition,
  Surgery,
  Test,
  Vaccination,
  FamilyHistory,
  Medication,
  Consultation,
} from './types';

export const DEMO_MED_ID = 'MED-102948';

export const patient: Patient = {
  name: 'Aarav Mehta',
  medId: 'MED-102948',
  dob: '14 March 1998',
  age: 28,
  gender: 'Male',
  bloodGroup: 'O+',
  phone: '9820011234',
  email: 'aarav.mehta@example.com',
  address: '42, Palm Residency, Bandra West, Mumbai, Maharashtra 400050',
  personalPhone: '9820011234',
  emergencyContact: {
    name: 'Neha Mehta',
    relation: 'Spouse',
    phone: '9820044567',
  },
  lastConsultation: '08 Aug 2026',
  photoColor: 'from-teal-500 to-brand-500',
};

export const allergies: Allergy[] = [
  { id: 'a1', name: 'Penicillin', severity: 'Severe', reaction: 'Anaphylaxis, hives' },
  { id: 'a2', name: 'Sulfa Drugs', severity: 'Moderate', reaction: 'Skin rash' },
  { id: 'a3', name: 'Peanuts', severity: 'Mild', reaction: 'Mild itching' },
];

export const conditions: MedicalCondition[] = [
  {
    id: 'c1',
    name: 'Bronchial Asthma',
    diagnosedDate: '12 Jul 2015',
    status: 'Managed',
    notes: 'Controlled with inhaler. Avoids known triggers.',
  },
  {
    id: 'c2',
    name: 'Hypertension (Stage 1)',
    diagnosedDate: '02 Feb 2024',
    status: 'Active',
    notes: 'Monitored monthly. Lifestyle modifications advised.',
  },
  {
    id: 'c3',
    name: 'Vitamin D Deficiency',
    diagnosedDate: '18 Nov 2023',
    status: 'Managed',
    notes: 'Supplementation ongoing. Levels improving.',
  },
];

export const surgeries: Surgery[] = [
  {
    id: 's1',
    name: 'Appendectomy (Laparoscopic)',
    date: '05 May 2022',
    hospital: 'Lilavati Hospital, Mumbai',
    surgeon: 'Dr. Rajan Khanna',
    outcome: 'Full recovery, no complications',
  },
  {
    id: 's2',
    name: 'Tonsillectomy',
    date: '22 Oct 2008',
    hospital: 'Hinduja Hospital, Mumbai',
    surgeon: 'Dr. S. Nair',
    outcome: 'Full recovery',
  },
];

export const tests: Test[] = [
  { id: 't1', name: 'Complete Blood Count (CBC)', date: '08 Aug 2026', type: 'Hematology', result: 'Within normal range', status: 'Normal' },
  { id: 't2', name: 'Lipid Profile', date: '08 Aug 2026', type: 'Biochemistry', result: 'Slightly elevated LDL', status: 'Abnormal' },
  { id: 't3', name: 'Chest X-Ray', date: '21 Jun 2026', type: 'Radiology', result: 'Clear, no abnormalities', status: 'Normal' },
  { id: 't4', name: 'Vitamin D (25-OH)', date: '14 Mar 2026', type: 'Biochemistry', result: '28 ng/mL (low-normal)', status: 'Abnormal' },
  { id: 't5', name: 'HbA1c', date: '03 Jan 2026', type: 'Biochemistry', result: 'Pending', status: 'Pending' },
];

export const vaccinations: Vaccination[] = [
  { id: 'v1', name: 'Influenza', date: '15 Oct 2025', dose: 'Annual', nextDue: 'Oct 2026' },
  { id: 'v2', name: 'COVID-19 (Booster)', date: '20 Sep 2024', dose: 'Booster 2', nextDue: 'As advised' },
  { id: 'v3', name: 'Tetanus', date: '11 Jun 2023', dose: 'Booster', nextDue: 'Jun 2033' },
  { id: 'v4', name: 'Hepatitis B', date: '04 Feb 2019', dose: 'Complete (3 doses)', nextDue: 'Not required' },
];

export const familyHistory: FamilyHistory[] = [
  { id: 'f1', relation: 'Father', condition: 'Type 2 Diabetes', notes: 'Diagnosed at age 45. Managed with medication.' },
  { id: 'f2', relation: 'Mother', condition: 'Hypertension', notes: 'Long-standing. On antihypertensives.' },
  { id: 'f3', relation: 'Paternal Grandfather', condition: 'Coronary Artery Disease', notes: 'Bypass surgery at age 62.' },
  { id: 'f4', relation: 'Sister', condition: 'Asthma', notes: 'Childhood-onset, currently managed.' },
];

export const medications: Medication[] = [
  { id: 'm1', name: 'Amlodipine 5mg', reason: 'Hypertension', prescribedBy: 'Dr. Priya Sharma', date: '02 Feb 2024', duration: 'Ongoing', status: 'Current', dosage: 'Once daily, morning' },
  { id: 'm2', name: 'Salbutamol Inhaler', reason: 'Bronchial Asthma', prescribedBy: 'Dr. Vikram Rao', date: '12 Jul 2015', duration: 'As needed', status: 'Current', dosage: '2 puffs as needed' },
  { id: 'm3', name: 'Vitamin D3 60,000 IU', reason: 'Vitamin D Deficiency', prescribedBy: 'Dr. Priya Sharma', date: '18 Nov 2023', duration: '12 weeks', status: 'Current', dosage: 'Once weekly' },
  { id: 'm4', name: 'Amoxicillin 500mg', reason: 'Bacterial infection (fever)', prescribedBy: 'Dr. Anil Mehta', date: '21 Jun 2026', duration: '7 days', status: 'Completed', dosage: 'Three times daily' },
  { id: 'm5', name: 'Ibuprofen 400mg', reason: 'Minor injury pain', prescribedBy: 'Dr. Sanjay Gupta', date: '14 Mar 2026', duration: '5 days', status: 'Completed', dosage: 'As needed, max 3/day' },
  { id: 'm6', name: 'Cetirizine 10mg', reason: 'Skin rash', prescribedBy: 'Dr. Kavya Nair', date: '08 Aug 2026', duration: '10 days', status: 'Current', dosage: 'Once at night' },
  { id: 'm7', name: 'Metformin 500mg', reason: 'Pre-diabetes (preventive)', prescribedBy: 'Dr. Priya Sharma', date: '10 Aug 2023', duration: '6 months', status: 'Discontinued', dosage: 'Twice daily' },
];

export const consultations: Consultation[] = [
  {
    id: 'con1',
    date: '08 Aug 2026',
    doctor: 'Dr. Kavya Nair',
    specialization: 'Dermatologist',
    reason: 'Skin rash on forearms',
    diagnosis: 'Contact dermatitis',
    prescription: 'Cetirizine 10mg (10 days), topical calamine lotion',
    tests: 'None required',
    notes: 'Likely triggered by new detergent. Advised to switch to hypoallergenic products.',
    followUp: '18 Aug 2026',
  },
  {
    id: 'con2',
    date: '21 Jun 2026',
    doctor: 'Dr. Anil Mehta',
    specialization: 'General Physician',
    reason: 'Fever and body ache (3 days)',
    diagnosis: 'Viral fever',
    prescription: 'Amoxicillin 500mg (7 days), Paracetamol 650mg as needed',
    tests: 'CBC, Dengue panel (negative)',
    notes: 'Hydration and rest advised. Symptoms resolved within 5 days.',
    followUp: 'Not required',
  },
  {
    id: 'con3',
    date: '14 Mar 2026',
    doctor: 'Dr. Sanjay Gupta',
    specialization: 'Orthopedic Specialist',
    reason: 'Wrist pain after minor fall',
    diagnosis: 'Sprained wrist, no fracture',
    prescription: 'Ibuprofen 400mg (5 days), wrist brace for 2 weeks',
    tests: 'X-Ray wrist (no fracture)',
    notes: 'Rest and cold compress advised. Recovered fully in 10 days.',
    followUp: 'Not required',
  },
  {
    id: 'con4',
    date: '03 Jan 2026',
    doctor: 'Dr. Rohit Deshpande',
    specialization: 'Dentist',
    reason: 'Routine dental examination',
    diagnosis: 'Mild gingivitis, no cavities',
    prescription: 'Mouthwash (chlorhexidine) for 2 weeks',
    tests: 'Dental X-Ray (routine)',
    notes: 'Oral hygiene improved. Next routine check-up in 6 months.',
    followUp: '03 Jul 2026',
  },
  {
    id: 'con5',
    date: '02 Feb 2024',
    doctor: 'Dr. Priya Sharma',
    specialization: 'Cardiologist',
    reason: 'Elevated blood pressure on home monitoring',
    diagnosis: 'Stage 1 Hypertension',
    prescription: 'Amlodipine 5mg (ongoing), lifestyle modifications',
    tests: 'ECG (normal), Lipid profile, Renal function',
    notes: 'Low-sodium diet and regular exercise recommended. Monthly BP monitoring.',
    followUp: '02 Mar 2024',
  },
  {
    id: 'con6',
    date: '05 May 2022',
    doctor: 'Dr. Rajan Khanna',
    specialization: 'General Surgeon',
    reason: 'Acute abdominal pain',
    diagnosis: 'Acute appendicitis',
    prescription: 'Post-op antibiotics (5 days), analgesics',
    tests: 'Ultrasound abdomen, CBC',
    notes: 'Laparoscopic appendectomy performed same day. Discharged after 2 days.',
    followUp: '19 May 2022',
  },
];

export const recentSurgeryLabel = 'Appendectomy (Laparoscopic) — 05 May 2022';
