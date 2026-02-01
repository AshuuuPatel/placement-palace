import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { JobListings } from "@/components/jobs/JobListings";
import { useAuth } from "@/hooks/useAuth";

const Jobs = () => {
  const { role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && role !== "student") {
      navigate("/dashboard/" + (role === "placement_cell" ? "placement" : "company"));
    }
  }, [role, loading, navigate]);

  return (
    <DashboardLayout 
      title="Browse Jobs"
      subtitle="Explore available placement opportunities and apply"
    >
      <JobListings />
    </DashboardLayout>
  );
};

export default Jobs;
