import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { MoreHorizontal, Eye, Pencil, Trash2, Users, Briefcase } from "lucide-react";
import { toast } from "sonner";

interface JobPosting {
  id: string;
  title: string;
  status: string;
  job_type: string | null;
  deadline: string | null;
  created_at: string;
  applications_count?: number;
}

interface CompanyJobsListProps {
  refreshTrigger?: number;
}

export function CompanyJobsList({ refreshTrigger }: CompanyJobsListProps) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user, refreshTrigger]);

  async function fetchJobs() {
    if (!user) return;
    
    try {
      const { data: jobsData, error: jobsError } = await supabase
        .from("job_postings")
        .select("id, title, status, job_type, deadline, created_at")
        .eq("company_id", user.id)
        .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;

      // Fetch application counts for each job
      const jobIds = jobsData?.map((j) => j.id) || [];
      
      if (jobIds.length > 0) {
        const { data: countsData, error: countsError } = await supabase
          .from("job_applications")
          .select("job_id")
          .in("job_id", jobIds);

        if (!countsError && countsData) {
          const countMap = countsData.reduce((acc, app) => {
            acc[app.job_id] = (acc[app.job_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const jobsWithCounts = jobsData.map((job) => ({
            ...job,
            applications_count: countMap[job.id] || 0,
          }));
          setJobs(jobsWithCounts);
        } else {
          setJobs(jobsData || []);
        }
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateJobStatus(jobId: string, newStatus: "draft" | "active" | "closed" | "filled") {
    try {
      const { error } = await supabase
        .from("job_postings")
        .update({ status: newStatus })
        .eq("id", jobId);

      if (error) throw error;

      toast.success(`Job ${newStatus === "active" ? "published" : "status updated"}`);
      fetchJobs();
    } catch (error: any) {
      toast.error(error.message || "Failed to update job status");
    }
  }

  async function deleteJob(jobId: string) {
    if (!confirm("Are you sure you want to delete this job posting?")) return;

    try {
      const { error } = await supabase
        .from("job_postings")
        .delete()
        .eq("id", jobId);

      if (error) throw error;

      toast.success("Job deleted successfully");
      fetchJobs();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete job");
    }
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "active": return "default";
      case "draft": return "secondary";
      case "closed": return "outline";
      case "filled": return "secondary";
      default: return "secondary";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Job Postings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No job postings yet</p>
            <p className="text-sm">Create your first job posting to start receiving applications</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Your Job Postings ({jobs.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Applications</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{job.job_type || "N/A"}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(job.status)}>
                    {job.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {job.deadline
                    ? format(new Date(job.deadline), "MMM d, yyyy")
                    : "No deadline"}
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {job.applications_count || 0}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {job.status === "draft" && (
                        <DropdownMenuItem onClick={() => updateJobStatus(job.id, "active")}>
                          <Eye className="w-4 h-4 mr-2" />
                          Publish
                        </DropdownMenuItem>
                      )}
                      {job.status === "active" && (
                        <DropdownMenuItem onClick={() => updateJobStatus(job.id, "closed")}>
                          <Eye className="w-4 h-4 mr-2" />
                          Close
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => deleteJob(job.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
