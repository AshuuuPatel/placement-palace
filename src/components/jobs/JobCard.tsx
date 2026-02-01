import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, IndianRupee, Briefcase, Clock } from "lucide-react";

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

interface JobCardProps {
  job: JobPosting;
  onApply?: (jobId: string) => void;
  hasApplied?: boolean;
  showActions?: boolean;
  companyName?: string;
}

export function JobCard({ job, onApply, hasApplied, showActions = true, companyName }: JobCardProps) {
  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    const format = (n: number) => {
      if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
      return `${(n / 1000).toFixed(0)}K`;
    };
    if (min && max) return `₹${format(min)} - ₹${format(max)}`;
    if (min) return `₹${format(min)}+`;
    if (max) return `Up to ₹${format(max)}`;
    return null;
  };

  const isDeadlinePassed = job.deadline && new Date(job.deadline) < new Date();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{job.title}</CardTitle>
            {companyName && (
              <CardDescription className="flex items-center gap-1 mt-1">
                <Briefcase className="w-3 h-3" />
                {companyName}
              </CardDescription>
            )}
          </div>
          <div className="flex gap-2">
            <Badge variant={job.status === "active" ? "default" : "secondary"}>
              {job.status}
            </Badge>
            {job.job_type && (
              <Badge variant="outline">{job.job_type}</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {job.description}
        </p>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location}
            </span>
          )}
          {formatSalary(job.salary_min, job.salary_max) && (
            <span className="flex items-center gap-1">
              <IndianRupee className="w-4 h-4" />
              {formatSalary(job.salary_min, job.salary_max)}
            </span>
          )}
          {job.deadline && (
            <span className={`flex items-center gap-1 ${isDeadlinePassed ? "text-destructive" : ""}`}>
              <Calendar className="w-4 h-4" />
              {isDeadlinePassed ? "Deadline passed" : `Apply by ${format(new Date(job.deadline), "MMM d, yyyy")}`}
            </span>
          )}
        </div>

        {job.requirements && job.requirements.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.requirements.slice(0, 3).map((req, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {req.length > 30 ? req.slice(0, 30) + "..." : req}
              </Badge>
            ))}
            {job.requirements.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{job.requirements.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {showActions && (
          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Posted {format(new Date(job.created_at), "MMM d, yyyy")}
            </span>
            {onApply && (
              <Button 
                size="sm" 
                onClick={() => onApply(job.id)}
                disabled={hasApplied || isDeadlinePassed || job.status !== "active"}
              >
                {hasApplied ? "Applied" : isDeadlinePassed ? "Closed" : "Apply Now"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
