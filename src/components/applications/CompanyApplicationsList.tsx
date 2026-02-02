import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";
import { UpdateStatusDialog } from "./UpdateStatusDialog";
import { format } from "date-fns";
import { Search, Users, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type ApplicationStatus = "pending" | "reviewing" | "shortlisted" | "interview" | "offered" | "rejected" | "withdrawn";

interface Application {
  id: string;
  job_id: string;
  student_id: string;
  status: ApplicationStatus;
  cover_letter: string | null;
  applied_at: string;
  job_title: string;
  candidate_name: string;
  candidate_email: string;
}

interface CompanyApplicationsListProps {
  refreshTrigger?: number;
}

export function CompanyApplicationsList({ refreshTrigger }: CompanyApplicationsListProps) {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchApplications();
      fetchJobs();
    }
  }, [user, refreshTrigger]);

  async function fetchJobs() {
    if (!user) return;
    const { data } = await supabase
      .from("job_postings")
      .select("id, title")
      .eq("company_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setJobs(data);
  }

  async function fetchApplications() {
    if (!user) return;
    setLoading(true);

    try {
      // First get company's job IDs
      const { data: jobsData } = await supabase
        .from("job_postings")
        .select("id, title")
        .eq("company_id", user.id);

      if (!jobsData || jobsData.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      const jobIds = jobsData.map((j) => j.id);
      const jobTitlesMap = Object.fromEntries(jobsData.map((j) => [j.id, j.title]));

      // Get applications for these jobs
      const { data: appsData, error } = await supabase
        .from("job_applications")
        .select("*")
        .in("job_id", jobIds)
        .order("applied_at", { ascending: false });

      if (error) throw error;

      if (!appsData || appsData.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      // Get student profiles
      const studentIds = [...new Set(appsData.map((a) => a.student_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", studentIds);

      const profilesMap = Object.fromEntries(
        (profilesData || []).map((p) => [p.user_id, { name: p.full_name, email: p.email }])
      );

      const enrichedApplications: Application[] = appsData.map((app) => ({
        id: app.id,
        job_id: app.job_id,
        student_id: app.student_id,
        status: app.status as ApplicationStatus,
        cover_letter: app.cover_letter,
        applied_at: app.applied_at,
        job_title: jobTitlesMap[app.job_id] || "Unknown Position",
        candidate_name: profilesMap[app.student_id]?.name || "Unknown",
        candidate_email: profilesMap[app.student_id]?.email || "No email",
      }));

      setApplications(enrichedApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.candidate_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesJob = jobFilter === "all" || app.job_id === jobFilter;
    return matchesSearch && matchesStatus && matchesJob;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Applications
            </CardTitle>
            <CardDescription>
              {applications.length} total application{applications.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="offered">Offered</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No applications found</p>
            <p className="text-sm">
              {applications.length === 0
                ? "Post jobs to start receiving applications"
                : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <>
                    <TableRow key={app.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{app.candidate_name}</p>
                          <p className="text-sm text-muted-foreground">{app.candidate_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{app.job_title}</TableCell>
                      <TableCell>
                        <ApplicationStatusBadge status={app.status} />
                      </TableCell>
                      <TableCell>{format(new Date(app.applied_at), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {app.cover_letter && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              {expandedId === app.id ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                          <UpdateStatusDialog
                            applicationId={app.id}
                            currentStatus={app.status}
                            candidateName={app.candidate_name}
                            onSuccess={fetchApplications}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedId === app.id && app.cover_letter && (
                      <TableRow key={`${app.id}-letter`}>
                        <TableCell colSpan={5} className="bg-muted/30">
                          <div className="p-4">
                            <p className="text-sm font-medium mb-2">Cover Letter</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {app.cover_letter}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
