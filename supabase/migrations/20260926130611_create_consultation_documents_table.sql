/*
# Create consultation_documents table for persistent PDF storage

1. Purpose
Store metadata for each generated consultation PDF report so documents are
permanently associated with the correct patient and consultation. The actual
PDF file is stored in Supabase Storage (bucket: consultation-docs). This table
tracks the file path, patient, consultation, and timestamps. A unique constraint
on consultation_id prevents duplicate documents for the same consultation.

2. New Table
- `consultation_documents`
  - `id` text PRIMARY KEY — app-generated unique ID
  - `patient_med_id` text NOT NULL — links to patient by MED-ID
  - `consultation_id` text NOT NULL — links to the source consultation (UNIQUE)
  - `file_name` text NOT NULL — the file name in storage
  - `file_path` text NOT NULL — full storage path (bucket/filename)
  - `doctor` text DEFAULT '' — doctor who generated the report
  - `consultation_date` text DEFAULT '' — date of the consultation
  - `created_at` timestamptz DEFAULT now()

3. Security
- RLS enabled on `consultation_documents`.
- Single-tenant demo app → all policies use `TO anon, authenticated`.

4. Important Notes
- The UNIQUE constraint on `consultation_id` prevents duplicate documents.
  When a consultation is re-saved, the app should check for an existing document
  first and update it rather than inserting a new one.
- The storage bucket `consultation-docs` is created separately and set to public
  read so the patient portal can view/download without auth.
*/

CREATE TABLE IF NOT EXISTS consultation_documents (
  id text PRIMARY KEY,
  patient_med_id text NOT NULL,
  consultation_id text NOT NULL UNIQUE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  doctor text DEFAULT '',
  consultation_date text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consultation_documents ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_consultation_documents_patient ON consultation_documents(patient_med_id);

DROP POLICY IF EXISTS "anon_select_consultation_documents" ON consultation_documents;
CREATE POLICY "anon_select_consultation_documents"
  ON consultation_documents FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_consultation_documents" ON consultation_documents;
CREATE POLICY "anon_insert_consultation_documents"
  ON consultation_documents FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_consultation_documents" ON consultation_documents;
CREATE POLICY "anon_update_consultation_documents"
  ON consultation_documents FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_consultation_documents" ON consultation_documents;
CREATE POLICY "anon_delete_consultation_documents"
  ON consultation_documents FOR DELETE
  TO anon, authenticated USING (true);