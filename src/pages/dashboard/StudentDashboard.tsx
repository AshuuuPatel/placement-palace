import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { 
  Briefcase, 
  FileText, 
  Bell, 
  Calendar, 
  TrendingUp,
  Building2,
  CheckCircle,
  Clock,
  UserCheck
} from "lucide-react";

interface ProfileFull {
  full_name: string;
  email: string;
  bio: string | null;
  phone: string | null;
  department: string | null;
  graduation_year: number | null;
  skills: string[] | null;
  education: any | null;
  resume_url: string | null;
}

const StudentDashboard = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileFull | null>(null);
  const [applicationCount, setApplicationCount] = useState(0);

  useEffect(() => {
    if (!loading && role && role !== "student") {
      navigate("/dashboard/" + (role === "placement_cell" ? "placement" : "company"));
    }
  }, [role, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchApplicationCount();
    }
  }, [user]);

  async function fetchProfile() {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("full_name, email, bio, phone, department, graduation_year, skills, education, resume_url")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) setProfile(data as any);
  }

  async function fetchApplicationCount() {
    if (!user) return;
    const { data } = await supabase
      .from("job_applications")
      .select("id")
      .eq("student_id", user.id);
    setApplicationCount(data?.length || 0);
  }

  function getProfileCompletion(): { percent: number; missing: string[] } {
    if (!profile) return { percent: 0, missing: [] };
    const checks: { label: string; done: boolean }[] = [
      { label: "Full name", done: !!profile.full_name },
      { label: "Phone", done: !!profile.phone },
      { label: "Department", done: !!profile.department },
      { label: "Graduation year", done: !!profile.graduation_year },
      { label: "Bio", done: !!profile.bio },
      { label: "Skills", done: !!(profile.skills && profile.skills.length > 0) },
      { label: "Education", done: !!(profile.education && (Array.isArray(profile.education) ? profile.education.length > 0 : false)) },
      { label: "Resume", done: !!profile.resume_url },
    ];
    const done = checks.filter((c) => c.done).length;
    const missing = checks.filter((c) => !c.done).map((c) => c.label);
    return { percent: Math.round((done / checks.length) * 100), missing };
  }

  const completion = getProfileCompletion();

  const stats = [
    { label: "Applications Sent", value: String(applicationCount), icon: FileText, color: "text-accent" },
    { label: "Interviews Scheduled", value: "0", icon: Calendar, color: "text-success" },
    { label: "Offers Received", value: "0", icon: CheckCircle, color: "text-warning" },
    { label: "Profile Views", value: "0", icon: TrendingUp, color: "text-accent" },
  ];

  return (
    <DashboardLayout 
      title={`Welcome, ${profile?.full_name || "Student"}!`}
      subtitle="Manage your placement journey from here"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profile Completion */}
      {profile && completion.percent < 100 && (
        <Card className="mb-8 border-accent/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-foreground">Profile Completion</p>
                  <span className="text-sm font-bold text-accent">{completion.percent}%</span>
                </div>
                <Progress value={completion.percent} className="h-2" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Missing: {completion.missing.join(", ")}.{" "}
              <Link to="/dashboard/profile" className="text-accent hover:underline font-medium">
                Complete your profile →
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-2">
              <Briefcase className="w-6 h-6 text-accent" />
            </div>
            <CardTitle>Browse Jobs</CardTitle>
            <CardDescription>Explore available placement opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/dashboard/jobs">View Openings</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-2">
              <FileText className="w-6 h-6 text-success" />
            </div>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Manage your skills, education & resume</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/dashboard/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mb-2">
              <Bell className="w-6 h-6 text-warning" />
            </div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Stay updated on your applications</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">View All</Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity yet.</p>
            <p className="text-sm">Start by browsing available job openings!</p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default StudentDashboard;
