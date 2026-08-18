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
