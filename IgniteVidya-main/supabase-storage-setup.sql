-- Storage Setup for Family Photos
-- Run this in Supabase SQL Editor

-- Create storage bucket for family photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('family-photos', 'family-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for family photos
CREATE POLICY "Family members can view photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'family-photos');

CREATE POLICY "Admins can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'family-photos' AND
  auth.uid() IN (
    SELECT user_id FROM family_members WHERE is_admin = true
  )
);

CREATE POLICY "Admins can update photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'family-photos' AND
  auth.uid() IN (
    SELECT user_id FROM family_members WHERE is_admin = true
  )
);

CREATE POLICY "Admins can delete photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'family-photos' AND
  auth.uid() IN (
    SELECT user_id FROM family_members WHERE is_admin = true
  )
);
