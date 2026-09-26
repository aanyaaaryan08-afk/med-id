/*
# Create consultation_items table for structured medical-record categorization

1. Purpose
Store each individual medical item from a consultation as a separate row with
an explicit `category` field chosen by the doctor at submission time. This
replaces the unreliable keyword-guessing approach in `categorizeConsultation()`.
Every item retains its original information, date, doctor/consultation reference,
and relevant details. The frontend reads these rows to populate the correct
MED-ID sections and generate the consultation PDF from the same source data.

2. New Table
- `consultation_items`
  - `id` text PRIMARY KEY — app-generated unique ID
  - `patient_med_id` text NOT NULL — links to patient by MED-ID
  - `consultation_id` text NOT NULL — links to the source consultation
  - `category` text NOT NULL — explicit medical category, one of:
    'imaging', 'lab_test', 'medication', 'diagnosis', 'condition',
    'allergy', 'procedure', 'vaccination', 'recommendation', 'follow_up',
    'other'
  - `name` text NOT NULL — the item name / title
  - `details` text DEFAULT '' — additional details (dosage, result, severity, etc.)
  - `date` text DEFAULT '' — date of the item (defaults to consultation date)
  - `doctor` text DEFAULT '' — doctor who recorded the item
  - `status` text DEFAULT '' — status if applicable (Normal/Abnormal, Active/Resolved, etc.)
  - `created_at` timestamptz DEFAULT now()

3. Security
- RLS enabled on `consultation_items`.
- Single-tenant demo app (no Supabase auth sign-in) → all policies use
  `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`.

4. Important Notes
- The `category` column is the single source of truth for where an item appears
  in the MED-ID UI. The doctor selects it from a dropdown — no keyword guessing.
- Each item keeps its `consultation_id` so the PDF report can pull the exact
  same structured data that was saved.
- The existing `consultations` table is unchanged — it remains the consultation
  header (doctor, date, reason, etc.). `consultation_items` holds the line items.
*/

CREATE TABLE IF NOT EXISTS consultation_items (
  id text PRIMARY KEY,
  patient_med_id text NOT NULL,
  consultation_id text NOT NULL,
  category text NOT NULL,
  name text NOT NULL,
  details text DEFAULT '',
  date text DEFAULT '',
  doctor text DEFAULT '',
  status text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consultation_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_consultation_items_patient ON consultation_items(patient_med_id);
CREATE INDEX IF NOT EXISTS idx_consultation_items_consultation ON consultation_items(consultation_id);

DROP POLICY IF EXISTS "anon_select_consultation_items" ON consultation_items;
CREATE POLICY "anon_select_consultation_items"
  ON consultation_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_consultation_items" ON consultation_items;
CREATE POLICY "anon_insert_consultation_items"
  ON consultation_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_consultation_items" ON consultation_items;
CREATE POLICY "anon_update_consultation_items"
  ON consultation_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_consultation_items" ON consultation_items;
CREATE POLICY "anon_delete_consultation_items"
  ON consultation_items FOR DELETE
  TO anon, authenticated USING (true);
