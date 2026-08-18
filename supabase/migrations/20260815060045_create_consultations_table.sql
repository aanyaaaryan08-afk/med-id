/*
# Create shared consultations table for MED-ID patient & doctor portals

1. New Tables
- `consultations`
  - `id` (text, primary key) — app-generated unique ID
  - `patient_med_id` (text, not null) — links consultation to a patient by MED-ID (e.g. "MED-102948")
  - `date` (text, not null) — display date string like "08 Aug 2026"
  - `doctor` (text, not null) — doctor name
  - `specialization` (text, not null) — doctor specialization
  - `reason` (text, not null) — symptoms / reason for visit
  - `diagnosis` (text, not null) — diagnosis
  - `prescription` (text, not null) — prescription details
  - `tests` (text, not null) — tests performed
  - `notes` (text, not null) — doctor's notes
  - `follow_up` (text, not null) — follow-up date or "Not required"
  - `created_at` (timestamptz, default now()) — server timestamp for ordering

2. Security
- Enable RLS on `consultations`.
- This is a single-tenant demo app with no Supabase auth sign-in screen.
  Both the patient portal and doctor portal use the anon key, so policies
  must allow `anon, authenticated` to read and write all rows.
- 4 separate CRUD policies (select/insert/update/delete), all `TO anon, authenticated`.

3. Seed Data
- Inserts the 6 existing demo consultations for patient MED-102948
  so the patient portal continues to show the same history after migrating
  from in-memory data to Supabase.

4. Important Notes
- The `patient_med_id` column lets us query consultations for any patient by MED-ID.
- `created_at` provides a secondary sort key alongside the display `date`.
- The table is intentionally shared/public (single-tenant demo) so both portals
  see the same consultation records in real time.
*/

CREATE TABLE IF NOT EXISTS consultations (
  id text PRIMARY KEY,
  patient_med_id text NOT NULL,
  date text NOT NULL,
  doctor text NOT NULL,
  specialization text NOT NULL,
  reason text NOT NULL,
  diagnosis text NOT NULL,
  prescription text NOT NULL,
  tests text NOT NULL,
  notes text NOT NULL,
  follow_up text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- SELECT: anyone (anon) can read all consultations (single-tenant demo)
DROP POLICY IF EXISTS "anon_select_consultations" ON consultations;
CREATE POLICY "anon_select_consultations"
  ON consultations FOR SELECT
  TO anon, authenticated USING (true);

-- INSERT: anyone (anon) can add consultations
DROP POLICY IF EXISTS "anon_insert_consultations" ON consultations;
CREATE POLICY "anon_insert_consultations"
  ON consultations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- UPDATE: anyone (anon) can update consultations
DROP POLICY IF EXISTS "anon_update_consultations" ON consultations;
CREATE POLICY "anon_update_consultations"
  ON consultations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- DELETE: anyone (anon) can delete consultations
DROP POLICY IF EXISTS "anon_delete_consultations" ON consultations;
CREATE POLICY "anon_delete_consultations"
  ON consultations FOR DELETE
  TO anon, authenticated USING (true);

-- Index for fast lookup by patient MED-ID
CREATE INDEX IF NOT EXISTS idx_consultations_patient_med_id ON consultations(patient_med_id);

-- Seed demo consultations for MED-102948 (only if table is empty)
INSERT INTO consultations (id, patient_med_id, date, doctor, specialization, reason, diagnosis, prescription, tests, notes, follow_up)
SELECT * FROM (VALUES
  ('con1', 'MED-102948', '08 Aug 2026', 'Dr. Kavya Nair', 'Dermatologist', 'Skin rash on forearms', 'Contact dermatitis', 'Cetirizine 10mg (10 days), topical calamine lotion', 'None required', 'Likely triggered by new detergent. Advised to switch to hypoallergenic products.', '18 Aug 2026'),
  ('con2', 'MED-102948', '21 Jun 2026', 'Dr. Anil Mehta', 'General Physician', 'Fever and body ache (3 days)', 'Viral fever', 'Amoxicillin 500mg (7 days), Paracetamol 650mg as needed', 'CBC, Dengue panel (negative)', 'Hydration and rest advised. Symptoms resolved within 5 days.', 'Not required'),
  ('con3', 'MED-102948', '14 Mar 2026', 'Dr. Sanjay Gupta', 'Orthopedic Specialist', 'Wrist pain after minor fall', 'Sprained wrist, no fracture', 'Ibuprofen 400mg (5 days), wrist brace for 2 weeks', 'X-Ray wrist (no fracture)', 'Rest and cold compress advised. Recovered fully in 10 days.', 'Not required'),
  ('con4', 'MED-102948', '03 Jan 2026', 'Dr. Rohit Deshpande', 'Dentist', 'Routine dental examination', 'Mild gingivitis, no cavities', 'Mouthwash (chlorhexidine) for 2 weeks', 'Dental X-Ray (routine)', 'Oral hygiene improved. Next routine check-up in 6 months.', '03 Jul 2026'),
  ('con5', 'MED-102948', '02 Feb 2024', 'Dr. Priya Sharma', 'Cardiologist', 'Elevated blood pressure on home monitoring', 'Stage 1 Hypertension', 'Amlodipine 5mg (ongoing), lifestyle modifications', 'ECG (normal), Lipid profile, Renal function', 'Low-sodium diet and regular exercise recommended. Monthly BP monitoring.', '02 Mar 2024'),
  ('con6', 'MED-102948', '05 May 2022', 'Dr. Rajan Khanna', 'General Surgeon', 'Acute abdominal pain', 'Acute appendicitis', 'Post-op antibiotics (5 days), analgesics', 'Ultrasound abdomen, CBC', 'Laparoscopic appendectomy performed same day. Discharged after 2 days.', '19 May 2022')
) AS v(id, patient_med_id, date, doctor, specialization, reason, diagnosis, prescription, tests, notes, follow_up)
WHERE NOT EXISTS (SELECT 1 FROM consultations LIMIT 1);
