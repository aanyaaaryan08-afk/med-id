import { supabase } from './supabase';

const BUCKET = 'consultation-docs';

export interface ConsultationDocument {
  id: string;
  patientMedId: string;
  consultationId: string;
  fileName: string;
  filePath: string;
  doctor: string;
  consultationDate: string;
  createdAt: string;
}

function rowToDoc(row: Record<string, unknown>): ConsultationDocument {
  return {
    id: row.id as string,
    patientMedId: row.patient_med_id as string,
    consultationId: row.consultation_id as string,
    fileName: row.file_name as string,
    filePath: row.file_path as string,
    doctor: (row.doctor as string) || '',
    consultationDate: (row.consultation_date as string) || '',
    createdAt: (row.created_at as string) || '',
  };
}

export async function fetchDocumentsForPatient(medId: string): Promise<ConsultationDocument[]> {
  const { data, error } = await supabase
    .from('consultation_documents')
    .select('*')
    .eq('patient_med_id', medId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Record<string, unknown>[]).map(rowToDoc);
}

export async function fetchDocumentForConsultation(consultationId: string): Promise<ConsultationDocument | null> {
  const { data, error } = await supabase
    .from('consultation_documents')
    .select('*')
    .eq('consultation_id', consultationId)
    .maybeSingle();
  if (error || !data) return null;
  return rowToDoc(data as Record<string, unknown>);
}

function genDocId(): string {
  return `doc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function uploadDocument(
  medId: string,
  consultationId: string,
  fileName: string,
  blob: Blob,
  doctor: string,
  consultationDate: string
): Promise<ConsultationDocument> {
  const filePath = `${medId}/${fileName}`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, blob, { contentType: 'application/pdf', upsert: true });
  if (upErr) throw upErr;

  const existing = await fetchDocumentForConsultation(consultationId);
  if (existing) {
    const { data, error } = await supabase
      .from('consultation_documents')
      .update({ file_name: fileName, file_path: filePath, doctor, consultation_date: consultationDate, created_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (data) return rowToDoc(data as Record<string, unknown>);
    return existing;
  }

  const docId = genDocId();
  const { data, error } = await supabase
    .from('consultation_documents')
    .insert({
      id: docId,
      patient_med_id: medId,
      consultation_id: consultationId,
      file_name: fileName,
      file_path: filePath,
      doctor,
      consultation_date: consultationDate,
    })
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return rowToDoc(data as Record<string, unknown>);
}

export function getDocumentUrl(filePath: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}
