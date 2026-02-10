
-- Add profile fields for students
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS graduation_year INTEGER,
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS resume_url TEXT;

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Students can upload their own resume
CREATE POLICY "Students can upload their own resume"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'resumes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Students can update their own resume
CREATE POLICY "Students can update their own resume"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'resumes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Students can view their own resume
CREATE POLICY "Students can view their own resume"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'resumes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Companies can view resumes of students who applied to their jobs
CREATE POLICY "Companies can view applicant resumes"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'resumes'
  AND EXISTS (
    SELECT 1 FROM public.job_applications ja
    JOIN public.job_postings jp ON jp.id = ja.job_id
    WHERE jp.company_id = auth.uid()
    AND ja.student_id::text = (storage.foldername(name))[1]
  )
);

-- Placement cell can view all resumes
CREATE POLICY "Placement cell can view all resumes"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'resumes'
  AND public.has_role(auth.uid(), 'placement_cell')
);

-- Students can delete their own resume
CREATE POLICY "Students can delete their own resume"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'resumes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
