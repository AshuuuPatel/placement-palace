import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CreateJobDialog } from "@/components/jobs/CreateJobDialog";
import { CompanyJobsList } from "@/components/jobs/CompanyJobsList";
import { 
  Users, 
  Briefcase, 
  Calendar, 
  FileText,
  Search,
  UserCheck,
  ClipboardList,
  Send
} from "lucide-react";

interface Profile {
  full_name: string;
  email: string;
}

const CompanyDashboard = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({
    activeJobs: 0,
    applications: 0,
    interviews: 0,
    offers: 0,
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!loading && role && role !== "company") {
      navigate("/dashboard/" + (role === "student" ? "student" : "placement"));
    }
  }, [role, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  async function fetchProfile() {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) setProfile(data);
  }

  async function fetchStats() {
    if (!user) return;
    try {
      // Fetch active job count
      const { data: jobsData } = await supabase
        .from("job_postings")
        .select("id")
        .eq("company_id", user.id)
        .eq("status", "active");

      const activeJobs = jobsData?.length || 0;

      // Fetch application count for company's jobs
      const { data: allJobs } = await supabase
        .from("job_postings")
        .select("id")
        .eq("company_id", user.id);

      const jobIds = allJobs?.map((j) => j.id) || [];
      
      let applications = 0;
      if (jobIds.length > 0) {
        const { data: appsData } = await supabase
          .from("job_applications")
          .select("id")
          .in("job_id", jobIds);
        applications = appsData?.length || 0;
      }

      setStats({
        activeJobs,
        applications,
        interviews: 0,
        offers: 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }

  function handleJobCreated() {
    setRefreshTrigger((prev) => prev + 1);
    fetchStats();
  }

  const statsData = [
    { label: "Active Job Postings", value: String(stats.activeJobs), icon: Briefcase, color: "text-accent" },
    { label: "Applications Received", value: String(stats.applications), icon: FileText, color: "text-success" },
    { label: "Interviews Scheduled", value: String(stats.interviews), icon: Calendar, color: "text-warning" },
    { label: "Offers Extended", value: String(stats.offers), icon: Send, color: "text-accent" },
  ];

  return (
    <DashboardLayout 
      title={`Welcome, ${profile?.full_name || "Recruiter"}!`}
      subtitle="Find and hire the best campus talent"
    >
      {/* Header with Create Job button */}
      <div className="flex justify-end mb-6">
        <CreateJobDialog onJobCreated={handleJobCreated} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsData.map((stat) => (
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

      {/* Job Postings List */}
      <div className="mb-8">
        <CompanyJobsList refreshTrigger={refreshTrigger} />
      </div>

      {/* Activity Sections */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No applications yet.</p>
              <p className="text-sm">Post a job to start receiving applications.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Shortlisted Candidates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No candidates shortlisted.</p>
              <p className="text-sm">Review applications to shortlist candidates.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CompanyDashboard;
