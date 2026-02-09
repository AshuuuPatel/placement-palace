
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- System can insert notifications (using service role or trigger)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create a function to generate notifications on application status change
CREATE OR REPLACE FUNCTION public.notify_application_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _job_title TEXT;
  _company_name TEXT;
  _status_label TEXT;
BEGIN
  -- Only fire on status changes
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Get job title
  SELECT title INTO _job_title
  FROM public.job_postings
  WHERE id = NEW.job_id;

  -- Get company name from profiles
  SELECT p.full_name INTO _company_name
  FROM public.job_postings jp
  JOIN public.profiles p ON p.user_id = jp.company_id
  WHERE jp.id = NEW.job_id;

  -- Format status label
  _status_label := INITCAP(REPLACE(NEW.status::text, '_', ' '));

  -- Insert notification for the student
  INSERT INTO public.notifications (user_id, title, message, metadata)
  VALUES (
    NEW.student_id,
    'Application Status Updated',
    'Your application for "' || COALESCE(_job_title, 'Unknown Position') || '" at ' || COALESCE(_company_name, 'a company') || ' has been updated to: ' || _status_label,
    jsonb_build_object(
      'application_id', NEW.id,
      'job_id', NEW.job_id,
      'old_status', OLD.status,
      'new_status', NEW.status
    )
  );

  RETURN NEW;
END;
$$;

-- Attach trigger to job_applications
CREATE TRIGGER on_application_status_change
AFTER UPDATE ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.notify_application_status_change();

-- Add index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read);
