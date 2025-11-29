-- =============================================
-- Storage Policies for "resumes" bucket
-- =============================================

-- 1. Create the bucket if it doesn't exist (though you said you created it)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on objects (Skipped: usually enabled by default, and altering it might cause permission errors)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow authenticated users to upload their own resumes
-- Path structure: userId/filename.pdf
CREATE POLICY "Users can upload own resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Policy: Allow authenticated users to read their own resumes
CREATE POLICY "Users can read own resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Policy: Allow authenticated users to delete their own resumes
CREATE POLICY "Users can delete own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. Policy: Allow public read access (optional, but often needed for public URLs)
-- If you want strict privacy, remove this and use signed URLs instead.
-- However, your schema.md says "file_url TEXT NOT NULL", implying public URLs or signed URLs.
-- Given the frontend uses getPublicUrl, we need this policy for public access OR 
-- we need to rely on the "Users can read own resumes" policy if using signed URLs.
-- But usually getPublicUrl requires the bucket to be public AND a policy allowing public select.
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resumes');
