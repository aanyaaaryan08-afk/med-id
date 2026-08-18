import { supabase } from './supabase';
import type {
  Patient,
  Allergy,
  MedicalCondition,
  Surgery,
  Test,
  Medication,
  Consultation,
} from '@/types';

export interface PatientRecords {
  patient: Patient;
  allergies: Allergy[];
  conditions: MedicalCondition[];
  medications: Medication[];
  surgeries: Surgery[];
  tests: Test[];
}

function calcAge(dob: string): number {
  const match = dob.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
  if (!match) return 0;
  const months: Record<string, number> = {
    January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
    July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
  };
  const day = parseInt(match[1], 10);
  const month = months[match[2]] ?? 0;
  const year = parseInt(match[3], 10);
  const birth = new Date(year, month, day);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const mDiff = now.getMonth() - birth.getMonth();
  if (mDiff < 0 || (mDiff === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function rowToPatient(row: Record<string, unknown>): Patient {
  return {
    name: row.name as string,
    medId: row.med_id as string,
    dob: row.dob as string,
    age: (row.age as number) || calcAge(row.dob as string),
    gender: (row.gender as string) || '',
    bloodGroup: row.blood_group as string,
    phone: (row.phone as string) || '',
    email: (row.email as string) || '',
    address: (row.address as string) || '',
    personalPhone: (row.personal_phone as string) || '',
    emergencyContact: {
      name: (row.emergency_contact_name as string) || '',
      relation: (row.emergency_contact_relation as string) || '',
      phone: (row.emergency_contact_phone as string) || '',
    },
    lastConsultation: '',
    photoColor: 'from-teal-500 to-brand-500',
  };
}

function rowToAllergy(row: Record<string, unknown>): Allergy {
  return {
    id: row.id as string,
    name: row.name as string,
    severity: (row.severity as string) as Allergy['severity'],
    reaction: (row.reaction as string) || '',
  };
}

function rowToCondition(row: Record<string, unknown>): MedicalCondition {
  return {
    id: row.id as string,
    name: row.name as string,
    diagnosedDate: (row.diagnosed_date as string) || '',
    status: (row.status as string) as MedicalCondition['status'],
    notes: (row.notes as string) || '',
  };
}

function rowToMedication(row: Record<string, unknown>): Medication {
  return {
    id: row.id as string,
    name: row.name as string,
    reason: (row.reason as string) || '',
    prescribedBy: (row.prescribed_by as string) || '',
    date: (row.date as string) || '',
    duration: (row.duration as string) || '',
    status: (row.status as string) as Medication['status'],
    dosage: (row.dosage as string) || '',
  };
}

function rowToSurgery(row: Record<string, unknown>): Surgery {
  return {
    id: row.id as string,
    name: row.name as string,
    date: (row.date as string) || '',
    hospital: (row.hospital as string) || '',
    surgeon: (row.surgeon as string) || '',
    outcome: (row.outcome as string) || '',
  };
}

function rowToTest(row: Record<string, unknown>): Test {
  return {
    id: row.id as string,
    name: row.name as string,
    date: (row.date as string) || '',
    type: (row.type as string) || '',
    result: (row.result as string) || '',
    status: (row.status as string) as Test['status'],
  };
}

export async function fetchPatient(medId: string): Promise<PatientRecords | null> {
  const { data: pData, error: pErr } = await supabase
    .from('patients')
    .select('*')
    .eq('med_id', medId)
    .maybeSingle();
  if (pErr || !pData) return null;

  const patient = rowToPatient(pData as Record<string, unknown>);

  const [allergiesRes, conditionsRes, medsRes, surgeriesRes, testsRes] = await Promise.all([
    supabase.from('patient_allergies').select('*').eq('patient_med_id', medId),
    supabase.from('patient_conditions').select('*').eq('patient_med_id', medId),
    supabase.from('patient_medications').select('*').eq('patient_med_id', medId),
    supabase.from('patient_surgeries').select('*').eq('patient_med_id', medId),
    supabase.from('patient_tests').select('*').eq('patient_med_id', medId),
  ]);

  return {
    patient,
    allergies: (allergiesRes.data as Record<string, unknown>[] | null)?.map(rowToAllergy) ?? [],
    conditions: (conditionsRes.data as Record<string, unknown>[] | null)?.map(rowToCondition) ?? [],
    medications: (medsRes.data as Record<string, unknown>[] | null)?.map(rowToMedication) ?? [],
    surgeries: (surgeriesRes.data as Record<string, unknown>[] | null)?.map(rowToSurgery) ?? [],
    tests: (testsRes.data as Record<string, unknown>[] | null)?.map(rowToTest) ?? [],
  };
}

function genMedId(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `MED-${num}`;
}

export async function generateUniqueMedId(): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const id = genMedId();
    const { data } = await supabase
      .from('patients')
      .select('med_id')
      .eq('med_id', id)
      .maybeSingle();
    if (!data) return id;
  }
  return `MED-${Date.now().toString().slice(-6)}`;
}

function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface RegistrationData {
  name: string;
  dob: string;
  aadhaar: string;
  bloodGroup: string;
  allergies: string;
  currentMedications: string;
  medicalConditions: string;
  previousSurgeries: string;
  personalPhone: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  emergencyInfo: string;
}

function parseLines(input: string): string[] {
  return input
    .split(/[,\n;]|\band\b/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export async function createPatient(data: RegistrationData): Promise<string> {
  const medId = await generateUniqueMedId();

  const { error: pErr } = await supabase.from('patients').insert({
    med_id: medId,
    name: data.name,
    dob: data.dob,
    age: calcAge(data.dob),
    gender: '',
    blood_group: data.bloodGroup,
    phone: '',
    email: '',
    address: '',
    personal_phone: data.personalPhone,
    emergency_contact_name: data.emergencyContactName,
    emergency_contact_relation: data.emergencyContactRelation,
    emergency_contact_phone: data.emergencyContactPhone,
    emergency_info: data.emergencyInfo,
    aadhaar: data.aadhaar,
  });
  if (pErr) throw new Error('Failed to create patient record');

  const allergyNames = parseLines(data.allergies);
  if (allergyNames.length > 0) {
    const rows = allergyNames.map((name) => ({
      id: genId('alg'),
      patient_med_id: medId,
      name,
      severity: 'Moderate' as const,
      reaction: '',
    }));
    await supabase.from('patient_allergies').insert(rows);
  }

  const medNames = parseLines(data.currentMedications);
  if (medNames.length > 0) {
    const rows = medNames.map((name) => ({
      id: genId('med'),
      patient_med_id: medId,
      name,
      reason: '',
      prescribed_by: '',
      date: '',
      duration: '',
      status: 'Current' as const,
      dosage: '',
    }));
    await supabase.from('patient_medications').insert(rows);
  }

  const condNames = parseLines(data.medicalConditions);
  if (condNames.length > 0) {
    const rows = condNames.map((name) => ({
      id: genId('con'),
      patient_med_id: medId,
      name,
      diagnosed_date: '',
      status: 'Active' as const,
      notes: '',
    }));
    await supabase.from('patient_conditions').insert(rows);
  }

  const surgNames = parseLines(data.previousSurgeries);
  if (surgNames.length > 0) {
    const rows = surgNames.map((name) => ({
      id: genId('sur'),
      patient_med_id: medId,
      name,
      date: '',
      hospital: '',
      surgeon: '',
      outcome: '',
    }));
    await supabase.from('patient_surgeries').insert(rows);
  }

  return medId;
}

export async function patientExists(medId: string): Promise<boolean> {
  const { data } = await supabase
    .from('patients')
    .select('med_id')
    .eq('med_id', medId)
    .maybeSingle();
  return !!data;
}

export interface PatientSearchResult {
  medId: string;
  name: string;
  bloodGroup: string;
  dob: string;
}

export async function searchPatients(query: string): Promise<PatientSearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  const upperQ = q.toUpperCase();
  const isMedId = upperQ.startsWith('MED-');

  let queryBuilder = supabase
    .from('patients')
    .select('med_id, name, blood_group, dob');

  if (isMedId) {
    queryBuilder = queryBuilder.ilike('med_id', `%${q}%`);
  } else {
    queryBuilder = queryBuilder.ilike('name', `%${q}%`);
  }

  const { data, error } = await queryBuilder.limit(10);
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map((row) => ({
    medId: row.med_id as string,
    name: row.name as string,
    bloodGroup: row.blood_group as string,
    dob: row.dob as string,
  }));
}

export async function fetchPatientPersonalPhone(medId: string): Promise<string> {
  const { data } = await supabase
    .from('patients')
    .select('personal_phone')
    .eq('med_id', medId)
    .maybeSingle();
  return (data as Record<string, unknown> | null)?.personal_phone as string ?? '';
}

export async function addCondition(medId: string, name: string, notes: string): Promise<void> {
  await supabase.from('patient_conditions').insert({
    id: genId('con'),
    patient_med_id: medId,
    name,
    diagnosed_date: '',
    status: 'Active',
    notes,
  });
}

export async function addAllergy(medId: string, name: string): Promise<void> {
  await supabase.from('patient_allergies').insert({
    id: genId('alg'),
    patient_med_id: medId,
    name,
    severity: 'Moderate',
    reaction: '',
  });
}

export async function addMedication(medId: string, name: string, reason: string, prescribedBy: string): Promise<void> {
  await supabase.from('patient_medications').insert({
    id: genId('med'),
    patient_med_id: medId,
    name,
    reason,
    prescribed_by: prescribedBy,
    date: '',
    duration: '',
    status: 'Current',
    dosage: '',
  });
}

export async function addSurgery(medId: string, name: string, date: string, hospital: string, surgeon: string, outcome: string): Promise<void> {
  await supabase.from('patient_surgeries').insert({
    id: genId('sur'),
    patient_med_id: medId,
    name,
    date,
    hospital,
    surgeon,
    outcome,
  });
}

export async function addTest(medId: string, name: string, date: string, type: string, result: string, status: Test['status']): Promise<void> {
  await supabase.from('patient_tests').insert({
    id: genId('tst'),
    patient_med_id: medId,
    name,
    date,
    type,
    result,
    status,
  });
}

export async function categorizeConsultation(medId: string, c: Consultation): Promise<void> {
  const diagnosisLower = c.diagnosis.toLowerCase();
  const prescriptionLower = c.prescription.toLowerCase();
  const testsLower = c.tests.toLowerCase();
  const reasonLower = c.reason.toLowerCase();

  if (diagnosisLower !== 'none' && diagnosisLower.length > 0) {
    await addCondition(medId, c.diagnosis, `Diagnosed during consultation on ${c.date} by ${c.doctor}. Reason: ${c.reason}`);
  }

  if (prescriptionLower !== 'none' && prescriptionLower.length > 0) {
    const meds = prescriptionLower.split(/[,;]/).map((m) => m.trim()).filter((m) => m.length > 0);
    for (const med of meds) {
      await addMedication(medId, med, c.diagnosis, c.doctor);
    }
  }

  if (testsLower !== 'none' && testsLower.length > 0) {
    const testNames = c.tests.split(/[,;]/).map((t) => t.trim()).filter((t) => t.length > 0);
    for (const testName of testNames) {
      const isNegative = /negative|normal|clear|no fracture|no abnormality/.test(testName.toLowerCase());
      await addTest(medId, testName, c.date, '', isNegative ? 'Normal' : 'Pending', isNegative ? 'Normal' : 'Pending');
    }
  }

  if (/surgery|surgical|operation|appendectomy|tonsillect|laparoscop|removal/.test(diagnosisLower + reasonLower)) {
    await addSurgery(medId, c.diagnosis, c.date, '', c.doctor, c.notes || '');
  }

  if (/allerg/.test(reasonLower + diagnosisLower)) {
    await addAllergy(medId, c.reason);
  }
}

export async function fetchLatestConsultation(medId: string): Promise<Consultation | null> {
  const { data, error } = await supabase
    .from('consultations')
    .select('*')
    .eq('patient_med_id', medId)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as Record<string, unknown>;
  return {
    id: row.id as string,
    date: row.date as string,
    doctor: row.doctor as string,
    specialization: row.specialization as string,
    reason: row.reason as string,
    diagnosis: row.diagnosis as string,
    prescription: row.prescription as string,
    tests: row.tests as string,
    notes: row.notes as string,
    followUp: row.follow_up as string,
  };
}
