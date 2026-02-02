import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ApplicationStatus = "pending" | "reviewing" | "shortlisted" | "interview" | "offered" | "rejected" | "withdrawn";

const statusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
  reviewing: { label: "Reviewing", className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  shortlisted: { label: "Shortlisted", className: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  interview: { label: "Interview", className: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  offered: { label: "Offered", className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  withdrawn: { label: "Withdrawn", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
};

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export function ApplicationStatusBadge({ status, className }: ApplicationStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <Badge variant="outline" className={cn(config.className, "border-0", className)}>
      {config.label}
    </Badge>
  );
}
