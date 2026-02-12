import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Download,
  FileText,
  Loader2,
} from "lucide-react";

interface Education {
  institution: string;
  degree: string;
  field: string;
  start_year: number;
  end_year: number | null;
  grade: string;
}

interface StudentProfile {
  full_name: string;
  email: string;
  bio: string | null;
  phone: string | null;
  department: string | null;
  graduation_year: number | null;
  skills: string[];
  education: Education[];
  resume_url: string | null;
}

interface StudentDetailDialogProps {
  studentId: string;
  studentName: string;
}

export function StudentDetailDialog({ studentId, studentName }: StudentDetailDialogProps) {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) fetchProfile();
  }, [open]);

  async function fetchProfile() {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("full_name, email, bio, phone, department, graduation_year, skills, education, resume_url")
      .eq("user_id", studentId)
      .maybeSingle();

    if (data) {
      setProfile({
        full_name: data.full_name,
        email: data.email,
        bio: (data as any).bio,
        phone: (data as any).phone,
        department: (data as any).department,
        graduation_year: (data as any).graduation_year,
        skills: (data as any).skills || [],
        education: ((data as any).education as Education[]) || [],
        resume_url: (data as any).resume_url,
      });
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <User className="w-4 h-4 mr-1" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Candidate Profile</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : !profile ? (
          <p className="text-sm text-muted-foreground py-4">Profile not found.</p>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-5 pr-4">
              {/* Header */}
              <div>
                <h3 className="text-xl font-semibold text-foreground">{profile.full_name}</h3>
                {profile.department && (
                  <p className="text-sm text-muted-foreground">{profile.department}</p>
                )}
              </div>

              {/* Contact */}
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="w-4 h-4" /> {profile.email}
                </span>
                {profile.phone && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="w-4 h-4" /> {profile.phone}
                  </span>
                )}
                {profile.graduation_year && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <GraduationCap className="w-4 h-4" /> Class of {profile.graduation_year}
                  </span>
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">About</h4>
                    <p className="text-sm text-muted-foreground">{profile.bio}</p>
                  </div>
                </>
              )}

              {/* Skills */}
              {profile.skills.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" /> Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Education */}
              {profile.education.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" /> Education
                    </h4>
                    <div className="space-y-3">
                      {profile.education.map((edu, i) => (
                        <div key={i} className="border border-border rounded-md p-3">
                          <p className="font-medium text-sm">{edu.degree} in {edu.field}</p>
                          <p className="text-sm text-muted-foreground">{edu.institution}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {edu.start_year} – {edu.end_year ?? "Present"}
                            {edu.grade && ` • ${edu.grade}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Resume */}
              {profile.resume_url && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                      <FileText className="w-4 h-4" /> Resume
                    </h4>
                    <Button variant="outline" size="sm" onClick={async () => {
                      const filePath = profile.resume_url!.includes("/resumes/")
                        ? profile.resume_url!.split("/resumes/")[1]
                        : profile.resume_url!;
                      if (!filePath) return;
                      const { data } = await supabase.storage.from("resumes").createSignedUrl(filePath, 60);
                      if (data?.signedUrl) window.open(data.signedUrl, "_blank");
                    }}>
                      <Download className="w-4 h-4 mr-1" /> Download Resume
                    </Button>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
