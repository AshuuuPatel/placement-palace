import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Building2, 
  Calendar, 
  BarChart3,
  UserPlus,
  Briefcase,
  FileCheck,
  TrendingUp
} from "lucide-react";

interface Profile {
  full_name: string;
  email: string;
}

const PlacementDashboard = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!loading && role && role !== "placement_cell") {
      navigate("/dashboard/" + (role === "student" ? "student" : "company"));
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
    { label: "Registered Students", value: "0", icon: Users, color: "text-accent" },
    { label: "Partner Companies", value: "0", icon: Building2, color: "text-success" },
    { label: "Active Drives", value: "0", icon: Calendar, color: "text-warning" },
    { label: "Placements This Year", value: "0", icon: TrendingUp, color: "text-accent" },
  ];

  return (
    <DashboardLayout 
      title={`Welcome, ${profile?.full_name || "Admin"}!`}
      subtitle="Manage campus placements efficiently"
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

      {/* Management Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-2">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <CardTitle className="text-lg">Students</CardTitle>
            <CardDescription>Manage student profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">View All</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-2">
              <Building2 className="w-6 h-6 text-success" />
            </div>
            <CardTitle className="text-lg">Companies</CardTitle>
            <CardDescription>Manage partner companies</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">View All</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mb-2">
              <Briefcase className="w-6 h-6 text-warning" />
            </div>
            <CardTitle className="text-lg">Drives</CardTitle>
            <CardDescription>Schedule placement drives</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Manage</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-2">
              <BarChart3 className="w-6 h-6 text-accent" />
            </div>
            <CardTitle className="text-lg">Reports</CardTitle>
            <CardDescription>View analytics & reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Generate</Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              Recent Placements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No placements recorded yet.</p>
              <p className="text-sm">Start by adding companies and scheduling drives.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Drives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming drives scheduled.</p>
              <p className="text-sm">Create a new placement drive to get started.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PlacementDashboard;
