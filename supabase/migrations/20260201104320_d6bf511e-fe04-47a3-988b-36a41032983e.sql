-- Create job status enum
CREATE TYPE public.job_status AS ENUM ('draft', 'active', 'closed', 'filled');

-- Create application status enum
CREATE TYPE public.application_status AS ENUM ('pending', 'reviewing', 'shortlisted', 'interview', 'offered', 'rejected', 'withdrawn');

-- Create job_postings table
CREATE TABLE public.job_postings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  salary_min INTEGER,
  salary_max INTEGER,
  location TEXT,
  job_type TEXT DEFAULT 'full-time',
  deadline TIMESTAMP WITH TIME ZONE,
  status job_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job_applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  cover_letter TEXT,
  resume_url TEXT,
  status application_status NOT NULL DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, student_id)
);

-- Enable RLS
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Job Postings RLS Policies

-- Companies can view their own job postings
CREATE POLICY "Companies can view their own jobs"
ON public.job_postings
FOR SELECT
USING (company_id = auth.uid());

-- Companies can insert their own job postings
CREATE POLICY "Companies can create jobs"
ON public.job_postings
FOR INSERT
WITH CHECK (company_id = auth.uid() AND has_role(auth.uid(), 'company'::app_role));

-- Companies can update their own job postings
CREATE POLICY "Companies can update their own jobs"
ON public.job_postings
FOR UPDATE
USING (company_id = auth.uid());

-- Companies can delete their own job postings
CREATE POLICY "Companies can delete their own jobs"
ON public.job_postings
FOR DELETE
USING (company_id = auth.uid());

-- Students can view active job postings
CREATE POLICY "Students can view active jobs"
ON public.job_postings
FOR SELECT
USING (status = 'active' AND has_role(auth.uid(), 'student'::app_role));

-- Placement cell can view all job postings
CREATE POLICY "Placement cell can view all jobs"
ON public.job_postings
FOR SELECT
USING (has_role(auth.uid(), 'placement_cell'::app_role));

-- Job Applications RLS Policies

-- Students can view their own applications
CREATE POLICY "Students can view their own applications"
ON public.job_applications
FOR SELECT
USING (student_id = auth.uid());

-- Students can create applications
CREATE POLICY "Students can apply to jobs"
ON public.job_applications
FOR INSERT
WITH CHECK (student_id = auth.uid() AND has_role(auth.uid(), 'student'::app_role));

-- Students can update their own applications (withdraw)
CREATE POLICY "Students can update their own applications"
ON public.job_applications
FOR UPDATE
USING (student_id = auth.uid());

-- Companies can view applications for their jobs
CREATE POLICY "Companies can view applications for their jobs"
ON public.job_applications
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.job_postings 
  WHERE job_postings.id = job_applications.job_id 
  AND job_postings.company_id = auth.uid()
));

-- Companies can update application status for their jobs
CREATE POLICY "Companies can update applications for their jobs"
ON public.job_applications
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.job_postings 
  WHERE job_postings.id = job_applications.job_id 
  AND job_postings.company_id = auth.uid()
));

-- Placement cell can view all applications
CREATE POLICY "Placement cell can view all applications"
ON public.job_applications
FOR SELECT
USING (has_role(auth.uid(), 'placement_cell'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_job_postings_updated_at
BEFORE UPDATE ON public.job_postings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_job_applications_updated_at
BEFORE UPDATE ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();