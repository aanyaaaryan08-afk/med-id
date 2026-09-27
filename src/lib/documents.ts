import { supabase } from './supabase';

const BUCKET = 'consultation-docs';

export type DocumentCategory =
  | 'consultations'
  | 'prescriptions'
  | 'surgeries'
  | 'tests'
  | 'vaccinations'
  | 'other';

export interface ConsultationDocument {
  id: string;
  patientMedId: string;
  consultationId: string;
  fileName: string;
  filePath: string;
  doctor: string;
  consultationDate: string;
  createdAt: string;
  category: DocumentCategory;
}

export const DOCUMENT_CATEGORIES: { id: DocumentCategory; label: string }[] = [
  { id: 'consultations', label: 'Consultations' },
  { id: 'prescriptions', label: 'Prescriptions' },
  { id: 'surgeries', label: 'Surgeries' },
  { id: 'tests', label: 'Tests' },
  { id: 'vaccinations', label: 'Vaccinations' },
  { id: 'other', label: 'Other' },
];

const CATEGORY_KEYWORDS: { id: DocumentCategory; keywords: string[] }[] = [
  { id: 'consultations', keywords: ['consultation', 'consult'] },
  { id: 'prescriptions', keywords: ['prescription', 'prescribe', 'medication', 'rx'] },
  { id: 'surgeries', keywords: ['surgery', 'surgical', 'operation', 'procedure'] },
  { id: 'tests', keywords: ['test', 'lab', 'investigation', 'imaging', 'scan', 'x-ray', 'xray', 'mri', 'ct scan', 'blood'] },
  { id: 'vaccinations', keywords: ['vaccination', 'vaccine', 'immunization', 'jab'] },
];

export function deriveDocumentCategory(fileName: string): DocumentCategory {
  const lower = fileName.toLowerCase();
  for (const { id, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) return id;
  }
  return 'other';
}

function rowToDoc(row: Record<string, unknown>): ConsultationDocument {
  const fileName = (row.file_name as string) || '';
  return {
    id: row.id as string,
    patientMedId: row.patient_med_id as string,
    consultationId: row.consultation_id as string,
    fileName,
    filePath: row.file_path as string,
    doctor: (row.doctor as string) || '',
    consultationDate: (row.consultation_date as string) || '',
    createdAt: (row.created_at as string) || '',
    category: deriveDocumentCategory(fileName),
  };
}

export async function fetchDocumentsForPatient(medId: string): Promise<ConsultationDocument[]> {
  const { data, error } = await supabase
    .from('consultation_documents')
    .select('*')
    .eq('patient_med_id', medId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('fetchDocumentsForPatient error:', error.message);
    return [];
  }
  return (data as Record<string, unknown>[] | null)?.map(rowToDoc) ?? [];
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

export async function downloadDocument(filePath: string, fileName: string): Promise<void> {
  const { data, error } = await supabase.storage.from(BUCKET).download(filePath);
  if (error) throw error;
  const url = URL.createObjectURL(data as Blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function getDocumentBlobUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).download(filePath);
  if (error) throw error;
  return URL.createObjectURL(data as Blob);
}
