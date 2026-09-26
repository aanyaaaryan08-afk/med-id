import { supabase } from './supabase';
import type { ConsultationItem, ItemCategory } from '@/types';

function rowToItem(row: Record<string, unknown>): ConsultationItem {
  return {
    id: row.id as string,
    consultationId: row.consultation_id as string,
    category: row.category as ItemCategory,
    name: row.name as string,
    details: (row.details as string) || '',
    date: (row.date as string) || '',
    doctor: (row.doctor as string) || '',
    status: (row.status as string) || '',
  };
}

export async function fetchItemsForPatient(medId: string): Promise<ConsultationItem[]> {
  const { data, error } = await supabase
    .from('consultation_items')
    .select('*')
    .eq('patient_med_id', medId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as Record<string, unknown>[]).map(rowToItem);
}

export async function fetchItemsForConsultation(consultationId: string): Promise<ConsultationItem[]> {
  const { data, error } = await supabase
    .from('consultation_items')
    .select('*')
    .eq('consultation_id', consultationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as Record<string, unknown>[]).map(rowToItem);
}

function genId(): string {
  return `itm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function insertConsultationItems(
  medId: string,
  consultationId: string,
  items: { category: ItemCategory; name: string; details: string; date: string; doctor: string; status: string }[]
): Promise<void> {
  if (items.length === 0) return;
  const rows = items.map((item) => ({
    id: genId(),
    patient_med_id: medId,
    consultation_id: consultationId,
    category: item.category,
    name: item.name,
    details: item.details,
    date: item.date,
    doctor: item.doctor,
    status: item.status,
  }));
  const { error } = await supabase.from('consultation_items').insert(rows);
  if (error) throw error;
}

export interface CategorizedItems {
  imaging: ConsultationItem[];
  lab_test: ConsultationItem[];
  medication: ConsultationItem[];
  diagnosis: ConsultationItem[];
  condition: ConsultationItem[];
  allergy: ConsultationItem[];
  procedure: ConsultationItem[];
  vaccination: ConsultationItem[];
  recommendation: ConsultationItem[];
  follow_up: ConsultationItem[];
  other: ConsultationItem[];
}

export function categorizeItems(items: ConsultationItem[]): CategorizedItems {
  const empty: CategorizedItems = {
    imaging: [], lab_test: [], medication: [], diagnosis: [], condition: [],
    allergy: [], procedure: [], vaccination: [], recommendation: [],
    follow_up: [], other: [],
  };
  for (const item of items) {
    const bucket = empty[item.category];
    if (bucket) {
      bucket.push(item);
    } else {
      empty.other.push(item);
    }
  }
  return empty;
}
