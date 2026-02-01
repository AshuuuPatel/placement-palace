import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { JobCard } from "./JobCard";
import { ApplyJobDialog } from "./ApplyJobDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter } from "lucide-react";

interface JobPosting {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  salary_min: number | null;
  salary_max: number | null;
  location: string | null;
  job_type: string | null;
  deadline: string | null;
  status: string;
  created_at: string;
  company_id: string;
}

export function JobListings() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("all");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchAppliedJobs();
    }
  }, [user]);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery, jobTypeFilter]);

  async function fetchJobs() {
    try {
      const { data, error } = await supabase
        .from("job_postings")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAppliedJobs() {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select("job_id")
        .eq("student_id", user.id);

      if (error) throw error;
      setAppliedJobs(new Set(data?.map((a) => a.job_id) || []));
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
    }
  }

  function filterJobs() {
    let filtered = jobs;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query) ||
          job.location?.toLowerCase().includes(query)
      );
    }

    if (jobTypeFilter !== "all") {
      filtered = filtered.filter((job) => job.job_type === jobTypeFilter);
    }

    setFilteredJobs(filtered);
  }

  function handleApply(jobId: string) {
    setSelectedJobId(jobId);
    setApplyDialogOpen(true);
  }

  function handleApplicationSuccess() {
    if (selectedJobId) {
      setAppliedJobs((prev) => new Set([...prev, selectedJobId]));
    }
    setApplyDialogOpen(false);
    setSelectedJobId(null);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs by title, description, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No jobs found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onApply={handleApply}
              hasApplied={appliedJobs.has(job.id)}
            />
          ))}
        </div>
      )}

      <ApplyJobDialog
        jobId={selectedJobId}
        open={applyDialogOpen}
        onOpenChange={setApplyDialogOpen}
        onSuccess={handleApplicationSuccess}
      />
    </div>
  );
}
