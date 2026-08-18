import { supabase } from './supabase';
import type { Consultation } from '@/types';

function rowToConsultation(row: Record<string, unknown>): Consultation {
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

export async function fetchConsultations(medId: string): Promise<Consultation[]> {
  const { data, error } = await supabase
    .from('consultations')
    .select('*')
    .eq('patient_med_id', medId)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data as Record<string, unknown>[]).map(rowToConsultation);
}

export async function insertConsultation(
  medId: string,
  c: Omit<Consultation, 'id'>
): Promise<Consultation> {
  const id = `con-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const row = {
    id,
    patient_med_id: medId,
    date: c.date,
    doctor: c.doctor,
    specialization: c.specialization,
    reason: c.reason,
    diagnosis: c.diagnosis,
    prescription: c.prescription,
    tests: c.tests,
    notes: c.notes,
    follow_up: c.followUp,
  };

  const { data, error } = await supabase
    .from('consultations')
    .insert(row)
    .select('*')
    .single();

  if (error) throw error;
  return rowToConsultation(data as Record<string, unknown>);
}
