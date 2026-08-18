/*
# Add personal/OTP phone column and create OTP codes table

1. Changes to Existing Tables
- `patients` — adds `personal_phone` (text, default '') for the patient's
  OTP-capable phone number (distinct from the emergency contact phone).

2. New Tables
- `otp_codes`
  - `id` (uuid, primary key, auto-generated)
  - `patient_med_id` (text, not null) — links OTP to a patient
  - `code` (text, not null) — 6-digit OTP code
  - `purpose` (text, default 'patient_access') — e.g. patient_access, doctor_access
  - `phone_used` (text) — the phone number the OTP was sent to
  - `created_at` (timestamptz, default now())
  - `expires_at` (timestamptz, default now() + 5 minutes)
  - `verified` (boolean, default false)
  - `consumed` (boolean, default false)

3. Security
- RLS enabled on `otp_codes`.
- Single-tenant demo → `TO anon, authenticated` policies for all CRUD.
- The edge functions use the service-role key (bypassing RLS) to insert
  and verify OTP records; the frontend never touches this table directly.

4. Data Updates
- Sets `personal_phone` to '9820011234' for the demo patient MED-102948
  if not already set.

5. Important Notes
- OTP codes expire after 5 minutes.
- The `consumed` and `verified` flags prevent OTP reuse.
- Indexes on `patient_med_id` and `created_at` for fast lookups.
*/

-- Add personal/OTP phone number column to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS personal_phone text DEFAULT '';

-- Create OTP codes table for verification
CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_med_id text NOT NULL,
  code text NOT NULL,
  purpose text NOT NULL DEFAULT 'patient_access',
  phone_used text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '5 minutes'),
  verified boolean DEFAULT false,
  consumed boolean DEFAULT false
);
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_otp_med ON otp_codes(patient_med_id);
CREATE INDEX IF NOT EXISTS idx_otp_created ON otp_codes(created_at);

-- Policies for otp_codes
DROP POLICY IF EXISTS "anon_select_otp" ON otp_codes;
CREATE POLICY "anon_select_otp" ON otp_codes FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_otp" ON otp_codes;
CREATE POLICY "anon_insert_otp" ON otp_codes FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_otp" ON otp_codes;
CREATE POLICY "anon_update_otp" ON otp_codes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_otp" ON otp_codes;
CREATE POLICY "anon_delete_otp" ON otp_codes FOR DELETE TO anon, authenticated USING (true);

-- Add personal_phone to demo patient (fictional 10-digit Indian number)
UPDATE patients SET personal_phone = '9820011234' WHERE med_id = 'MED-102948' AND (personal_phone IS NULL OR personal_phone = '');
