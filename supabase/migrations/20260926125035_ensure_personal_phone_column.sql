/*
# Add personal_phone column to patients table

1. Purpose
The `personal_phone` column is referenced by the app (fetchPatientPersonalPhone,
registration) but was added in a later migration. This ensures it exists.

2. Changes
- `patients` table: add `personal_phone text DEFAULT ''` if not present.

3. Security
- No policy changes — existing patient policies cover all columns.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'personal_phone'
  ) THEN
    ALTER TABLE patients ADD COLUMN personal_phone text DEFAULT '';
  END IF;
END $$;