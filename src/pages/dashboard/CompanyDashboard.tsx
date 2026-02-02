import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CreateJobDialog } from "@/components/jobs/CreateJobDialog";
import { CompanyJobsList } from "@/components/jobs/CompanyJobsList";
import { CompanyApplicationsList } from "@/components/applications/CompanyApplicationsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, 
  Calendar, 
  FileText,
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
  }, [user, refreshTrigger]);

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

      // Fetch all jobs for application stats
      const { data: allJobs } = await supabase
        .from("job_postings")
        .select("id")
        .eq("company_id", user.id);

      const jobIds = allJobs?.map((j) => j.id) || [];
      
      let applications = 0;
      let interviews = 0;
      let offers = 0;

      if (jobIds.length > 0) {
        const { data: appsData } = await supabase
          .from("job_applications")
          .select("id, status")
          .in("job_id", jobIds);

        applications = appsData?.length || 0;
        interviews = appsData?.filter((a) => a.status === "interview").length || 0;
        offers = appsData?.filter((a) => a.status === "offered").length || 0;
      }

      setStats({ activeJobs, applications, interviews, offers });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }

  function handleJobCreated() {
    setRefreshTrigger((prev) => prev + 1);
  }

  function handleApplicationsUpdated() {
    fetchStats();
  }

  const statsData = [
    { label: "Active Jobs", value: String(stats.activeJobs), icon: Briefcase, color: "text-accent" },
    { label: "Applications", value: String(stats.applications), icon: FileText, color: "text-success" },
    { label: "Interviews", value: String(stats.interviews), icon: Calendar, color: "text-warning" },
    { label: "Offers", value: String(stats.offers), icon: Send, color: "text-accent" },
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
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
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

      {/* Tabs for Jobs and Applications */}
      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <CompanyJobsList refreshTrigger={refreshTrigger} />
        </TabsContent>

        <TabsContent value="applications">
          <CompanyApplicationsList refreshTrigger={refreshTrigger} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default CompanyDashboard;
