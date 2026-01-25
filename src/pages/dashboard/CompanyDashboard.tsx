import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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

  useEffect(() => {
    if (!loading && role && role !== "company") {
      navigate("/dashboard/" + (role === "student" ? "student" : "placement"));
    }
  }, [role, loading, navigate]);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setProfile(data);
        });
    }
  }, [user]);

  const stats = [
    { label: "Active Job Postings", value: "0", icon: Briefcase, color: "text-accent" },
    { label: "Applications Received", value: "0", icon: FileText, color: "text-success" },
    { label: "Interviews Scheduled", value: "0", icon: Calendar, color: "text-warning" },
    { label: "Offers Extended", value: "0", icon: Send, color: "text-accent" },
  ];

  return (
    <DashboardLayout 
      title={`Welcome, ${profile?.full_name || "Recruiter"}!`}
      subtitle="Find and hire the best campus talent"
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

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-2">
              <Briefcase className="w-6 h-6 text-accent" />
            </div>
            <CardTitle className="text-lg">Post Job</CardTitle>
            <CardDescription>Create new job listings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Create</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-2">
              <Search className="w-6 h-6 text-success" />
            </div>
            <CardTitle className="text-lg">Talent Pool</CardTitle>
            <CardDescription>Browse student profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Search</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mb-2">
              <Calendar className="w-6 h-6 text-warning" />
            </div>
            <CardTitle className="text-lg">Interviews</CardTitle>
            <CardDescription>Schedule campus visits</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Schedule</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-2">
              <ClipboardList className="w-6 h-6 text-accent" />
            </div>
            <CardTitle className="text-lg">Applications</CardTitle>
            <CardDescription>Review candidates</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Review</Button>
          </CardContent>
        </Card>
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
