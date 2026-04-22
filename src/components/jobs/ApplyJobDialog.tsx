import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileUp, CheckCircle2, X } from "lucide-react";

const applyFormSchema = z.object({
  cover_letter: z.string().max(2000, "Cover letter must be less than 2000 characters").optional(),
});

type ApplyFormValues = z.infer<typeof applyFormSchema>;

interface ApplyJobDialogProps {
  jobId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ApplyJobDialog({ jobId, open, onOpenChange, onSuccess }: ApplyJobDialogProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileResumeUrl, setProfileResumeUrl] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  const form = useForm<ApplyFormValues>({
    resolver: zodResolver(applyFormSchema),
    defaultValues: {
      cover_letter: "",
    },
  });

  useEffect(() => {
    if (open && user) {
      supabase
        .from("profiles")
        .select("resume_url")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          setProfileResumeUrl((data as any)?.resume_url || null);
        });
      setResumeFile(null);
    }
  }, [open, user]);

  function handleResumeSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Resume must be under 5MB");
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["pdf", "doc", "docx"].includes(ext)) {
      toast.error("Resume must be a PDF, DOC, or DOCX file");
      return;
    }
    setResumeFile(file);
  }

  async function onSubmit(values: ApplyFormValues) {
    if (!user || !jobId) return;

    // Require a resume — either an existing profile resume or a freshly uploaded one
    if (!resumeFile && !profileResumeUrl) {
      toast.error("Please upload your resume to apply");
      return;
    }

    setIsSubmitting(true);
    try {
      let resumePath: string | null = profileResumeUrl;

      // If the student uploaded a new resume for this application, store it
      if (resumeFile) {
        setUploadingResume(true);
        const ext = resumeFile.name.split(".").pop();
        const filePath = `${user.id}/application_${jobId}_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(filePath, resumeFile);
        setUploadingResume(false);

        if (uploadError) {
          throw new Error(uploadError.message);
        }
        resumePath = filePath;
      }

      const { error } = await supabase.from("job_applications").insert({
        job_id: jobId,
        student_id: user.id,
        cover_letter: values.cover_letter || null,
        resume_url: resumePath,
        status: "pending",
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("You have already applied to this job");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Application submitted successfully!");
      form.reset();
      setResumeFile(null);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
      setUploadingResume(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply for this Position</DialogTitle>
          <DialogDescription>
            Submit your application along with your resume. You can optionally include a cover letter.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Resume Section */}
            <div className="space-y-2">
              <Label>Resume <span className="text-destructive">*</span></Label>

              {resumeFile ? (
                <div className="border border-border rounded-lg p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    <span className="text-sm truncate">{resumeFile.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setResumeFile(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  {profileResumeUrl && (
                    <div className="border border-border rounded-lg p-3 flex items-center gap-2 bg-muted/40">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        Using resume from your profile. Upload below to send a different one.
                      </span>
                    </div>
                  )}
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:bg-muted/40 transition-colors">
                    <FileUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {profileResumeUrl ? "Upload a different resume" : "Upload resume (PDF, DOC, DOCX — max 5MB)"}
                    </span>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleResumeSelect}
                    />
                  </label>
                </>
              )}
            </div>

            <FormField
              control={form.control}
              name="cover_letter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Letter (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell the recruiter why you're a great fit for this role..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || uploadingResume}>
                {uploadingResume
                  ? "Uploading resume..."
                  : isSubmitting
                  ? "Submitting..."
                  : "Submit Application"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
