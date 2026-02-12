import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  GraduationCap,
  Briefcase,
  FileUp,
  Save,
  Plus,
  X,
  Trash2,
  Download,
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

interface ProfileData {
  full_name: string;
  email: string;
  bio: string;
  phone: string;
  department: string;
  graduation_year: number | null;
  skills: string[];
  education: Education[];
  resume_url: string | null;
}

const emptyEducation: Education = {
  institution: "",
  degree: "",
  field: "",
  start_year: new Date().getFullYear(),
  end_year: null,
  grade: "",
};

const StudentProfile = () => {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    email: "",
    bio: "",
    phone: "",
    department: "",
    graduation_year: null,
    skills: [],
    education: [],
    resume_url: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    if (!authLoading && role && role !== "student") {
      navigate("/dashboard/" + (role === "placement_cell" ? "placement" : "company"));
    }
  }, [role, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  async function fetchProfile() {
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, email, bio, phone, department, graduation_year, skills, education, resume_url")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setProfile({
        full_name: data.full_name || "",
        email: data.email || "",
        bio: (data as any).bio || "",
        phone: (data as any).phone || "",
        department: (data as any).department || "",
        graduation_year: (data as any).graduation_year || null,
        skills: (data as any).skills || [],
        education: ((data as any).education as Education[]) || [],
        resume_url: (data as any).resume_url || null,
      });
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        bio: profile.bio,
        phone: profile.phone,
        department: profile.department,
        graduation_year: profile.graduation_year,
        skills: profile.skills,
        education: profile.education as any,
      } as any)
      .eq("user_id", user.id);

    setSaving(false);
    if (error) {
      toast({ title: "Error saving profile", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile saved", description: "Your profile has been updated." });
    }
  }

  function addSkill() {
    const skill = newSkill.trim();
    if (skill && !profile.skills.includes(skill)) {
      setProfile((p) => ({ ...p, skills: [...p.skills, skill] }));
      setNewSkill("");
    }
  }

  function removeSkill(skill: string) {
    setProfile((p) => ({ ...p, skills: p.skills.filter((s) => s !== skill) }));
  }

  function addEducation() {
    setProfile((p) => ({ ...p, education: [...p.education, { ...emptyEducation }] }));
  }

  function updateEducation(index: number, field: keyof Education, value: string | number | null) {
    setProfile((p) => {
      const edu = [...p.education];
      edu[index] = { ...edu[index], [field]: value };
      return { ...p, education: edu };
    });
  }

  function removeEducation(index: number) {
    setProfile((p) => ({ ...p, education: p.education.filter((_, i) => i !== index) }));
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Resume must be under 5MB.", variant: "destructive" });
      return;
    }

    setUploadingResume(true);
    const filePath = `${user.id}/resume_${Date.now()}.${file.name.split(".").pop()}`;

    // Delete old resume if exists
    if (profile.resume_url) {
      // Handle both old public URLs and new path-only format
      const oldPath = profile.resume_url.includes("/resumes/")
        ? profile.resume_url.split("/resumes/")[1]
        : profile.resume_url;
      if (oldPath) await supabase.storage.from("resumes").remove([oldPath]);
    }

    const { error: uploadError } = await supabase.storage.from("resumes").upload(filePath, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploadingResume(false);
      return;
    }

    // Store the file path, not the public URL (bucket is private)
    await supabase
      .from("profiles")
      .update({ resume_url: filePath } as any)
      .eq("user_id", user.id);

    setProfile((p) => ({ ...p, resume_url: filePath }));
    setUploadingResume(false);
    toast({ title: "Resume uploaded", description: "Your resume has been saved." });
  }

  async function handleResumeDelete() {
    if (!user || !profile.resume_url) return;
    const oldPath = profile.resume_url.includes("/resumes/")
      ? profile.resume_url.split("/resumes/")[1]
      : profile.resume_url;
    if (oldPath) await supabase.storage.from("resumes").remove([oldPath]);

    await supabase
      .from("profiles")
      .update({ resume_url: null } as any)
      .eq("user_id", user.id);

    setProfile((p) => ({ ...p, resume_url: null }));
    toast({ title: "Resume removed" });
  }

  async function getSignedResumeUrl(path: string): Promise<string | null> {
    // Handle old public URLs - extract path
    const filePath = path.includes("/resumes/") ? path.split("/resumes/")[1] : path;
    if (!filePath) return null;
    const { data, error } = await supabase.storage.from("resumes").createSignedUrl(filePath, 60);
    if (error) {
      toast({ title: "Failed to get resume link", variant: "destructive" });
      return null;
    }
    return data.signedUrl;
  }

  if (authLoading || loading) {
    return (
      <DashboardLayout title="My Profile" subtitle="Manage your student profile">
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your student profile for recruiters">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column — Personal Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-accent" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={profile.email} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={profile.department}
                    onChange={(e) => setProfile((p) => ({ ...p, department: e.target.value }))}
                    placeholder="Computer Science"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduation_year">Graduation Year</Label>
                  <Input
                    id="graduation_year"
                    type="number"
                    value={profile.graduation_year ?? ""}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        graduation_year: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                    placeholder="2026"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell companies about yourself..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="w-5 h-5 text-accent" />
                  Education
                </CardTitle>
                <Button variant="outline" size="sm" onClick={addEducation}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile.education.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No education entries yet. Click "Add" to get started.
                </p>
              ) : (
                profile.education.map((edu, i) => (
                  <div key={i} className="relative border border-border rounded-lg p-4 space-y-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeEducation(i)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Institution</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => updateEducation(i, "institution", e.target.value)}
                          placeholder="University name"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Degree</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(i, "degree", e.target.value)}
                          placeholder="B.Tech"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Field of Study</Label>
                        <Input
                          value={edu.field}
                          onChange={(e) => updateEducation(i, "field", e.target.value)}
                          placeholder="Computer Science"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Grade / CGPA</Label>
                        <Input
                          value={edu.grade}
                          onChange={(e) => updateEducation(i, "grade", e.target.value)}
                          placeholder="9.2 CGPA"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Start Year</Label>
                        <Input
                          type="number"
                          value={edu.start_year}
                          onChange={(e) => updateEducation(i, "start_year", Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">End Year</Label>
                        <Input
                          type="number"
                          value={edu.end_year ?? ""}
                          onChange={(e) =>
                            updateEducation(i, "end_year", e.target.value ? Number(e.target.value) : null)
                          }
                          placeholder="Present"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column — Skills & Resume */}
        <div className="space-y-6">
          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="w-5 h-5 text-accent" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                />
                <Button variant="outline" size="icon" onClick={addSkill}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {profile.skills.length === 0 && (
                  <p className="text-sm text-muted-foreground">No skills added yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resume */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileUp className="w-5 h-5 text-accent" />
                Resume
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.resume_url ? (
                <div className="border border-border rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium text-foreground">Resume uploaded ✓</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={async () => {
                      const url = await getSignedResumeUrl(profile.resume_url!);
                      if (url) window.open(url, "_blank");
                    }}>
                      <Download className="w-4 h-4 mr-1" /> View
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleResumeDelete} className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <FileUp className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload your resume (PDF, max 5MB)
                  </p>
                  <label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleResumeUpload}
                    />
                    <Button variant="outline" size="sm" asChild disabled={uploadingResume}>
                      <span className="cursor-pointer">
                        {uploadingResume ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <FileUp className="w-4 h-4 mr-1" />
                        )}
                        Choose File
                      </span>
                    </Button>
                  </label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Profile
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;
