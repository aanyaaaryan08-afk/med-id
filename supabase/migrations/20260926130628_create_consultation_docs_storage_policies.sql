/*
# Storage policies for consultation-docs bucket

1. Purpose
Allow anyone (anon + authenticated) to upload, read, and delete PDF files
in the `consultation-docs` storage bucket. This is a single-tenant demo app
with no auth, so public access is intentional.

2. Security
- SELECT (read/download): allow all
- INSERT (upload): allow all
- DELETE: allow all
- UPDATE: allow all
*/

DROP POLICY IF EXISTS "anon_read_consultation_docs" ON storage.objects;
CREATE POLICY "anon_read_consultation_docs"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'consultation-docs');

DROP POLICY IF EXISTS "anon_insert_consultation_docs" ON storage.objects;
CREATE POLICY "anon_insert_consultation_docs"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'consultation-docs');

DROP POLICY IF EXISTS "anon_update_consultation_docs" ON storage.objects;
CREATE POLICY "anon_update_consultation_docs"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'consultation-docs')
  WITH CHECK (bucket_id = 'consultation-docs');

DROP POLICY IF EXISTS "anon_delete_consultation_docs" ON storage.objects;
CREATE POLICY "anon_delete_consultation_docs"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'consultation-docs');