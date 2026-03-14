import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileData {
  full_name?: string;
  phone?: string | null;
  department?: string | null;
  graduation_year?: number | null;
  bio?: string | null;
  skills?: string[] | null;
  education?: unknown | null;
  resume_url?: string | null;
}

export function getProfileStrength(profile: ProfileData) {
  const criteria = [
    { label: "Full Name", met: !!profile.full_name },
    { label: "Phone", met: !!profile.phone },
    { label: "Department", met: !!profile.department },
    { label: "Graduation Year", met: !!profile.graduation_year },
    { label: "Bio", met: !!profile.bio },
    { label: "Skills", met: Array.isArray(profile.skills) && profile.skills.length > 0 },
    { label: "Education", met: Array.isArray(profile.education) && (profile.education as unknown[]).length > 0 },
    { label: "Resume", met: !!profile.resume_url },
  ];
  const met = criteria.filter((c) => c.met).length;
  const percent = Math.round((met / criteria.length) * 100);
  const missing = criteria.filter((c) => !c.met).map((c) => c.label);
  return { percent, met, total: criteria.length, missing };
}

function getStrengthLevel(percent: number) {
  if (percent >= 80) return { label: "Strong", variant: "default" as const, icon: ShieldCheck, colorClass: "text-success" };
  if (percent >= 50) return { label: "Moderate", variant: "secondary" as const, icon: Shield, colorClass: "text-warning" };
  return { label: "Weak", variant: "destructive" as const, icon: ShieldAlert, colorClass: "text-destructive" };
}

interface ProfileStrengthBadgeProps {
  profile: ProfileData;
  compact?: boolean;
}

export function ProfileStrengthBadge({ profile, compact = false }: ProfileStrengthBadgeProps) {
  const { percent, met, total, missing } = getProfileStrength(profile);
  const level = getStrengthLevel(percent);
  const Icon = level.icon;

  if (compact) {
    return (
      <Badge variant={level.variant} className="gap-1 text-xs">
        <Icon className="w-3 h-3" />
        {percent}%
      </Badge>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium flex items-center gap-1.5">
          <Icon className={cn("w-4 h-4", level.colorClass)} />
          Profile Strength: {level.label}
        </span>
        <span className="text-sm text-muted-foreground">{met}/{total}</span>
      </div>
      <Progress value={percent} className="h-2" />
      {missing.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Missing: {missing.join(", ")}
        </p>
      )}
    </div>
  );
}
