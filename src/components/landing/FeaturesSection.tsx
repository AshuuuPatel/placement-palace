import { 
  FileText, 
  Calendar, 
  BarChart3, 
  Bell, 
  Search, 
  Shield,
  GraduationCap,
  Building2,
  Users
} from "lucide-react";

const studentFeatures = [
  { icon: FileText, title: "Smart Resume Builder", description: "Create ATS-friendly resumes with our guided builder" },
  { icon: Search, title: "Job Discovery", description: "Find opportunities matching your skills and interests" },
  { icon: Bell, title: "Real-time Alerts", description: "Get notified about new openings and application updates" },
];

const placementCellFeatures = [
  { icon: Calendar, title: "Drive Management", description: "Schedule and coordinate placement drives effortlessly" },
  { icon: BarChart3, title: "Analytics Dashboard", description: "Track placement metrics and generate reports" },
  { icon: Shield, title: "Student Verification", description: "Verify eligibility and manage student profiles" },
];

const companyFeatures = [
  { icon: Users, title: "Talent Pool Access", description: "Browse verified student profiles and resumes" },
  { icon: Calendar, title: "Interview Scheduling", description: "Book campus slots and manage interview rounds" },
  { icon: FileText, title: "Offer Management", description: "Send and track offer letters digitally" },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 lg:py-28 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need for
            <span className="text-gradient"> Successful Placements</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Purpose-built tools for every stakeholder in the campus placement process
          </p>
        </div>

        {/* Feature Categories */}
        <div className="space-y-16">
          <FeatureCategory
            icon={GraduationCap}
            title="For Students"
            description="Launch your career with confidence"
            features={studentFeatures}
            accent="accent"
          />
          
          <FeatureCategory
            icon={Users}
            title="For Placement Cell"
            description="Streamline your placement operations"
            features={placementCellFeatures}
            accent="success"
            reversed
          />
          
          <FeatureCategory
            icon={Building2}
            title="For Companies"
            description="Find and hire the best campus talent"
            features={companyFeatures}
            accent="warning"
          />
        </div>
      </div>
    </section>
  );
};

interface FeatureCategoryProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  features: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }[];
  accent: "accent" | "success" | "warning";
  reversed?: boolean;
}

const FeatureCategory = ({ icon: CategoryIcon, title, description, features, accent, reversed }: FeatureCategoryProps) => {
  const accentClasses = {
    accent: "bg-accent/10 text-accent border-accent/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
  };

  const iconBgClasses = {
    accent: "bg-accent/10",
    success: "bg-success/10",
    warning: "bg-warning/10",
  };

  const iconTextClasses = {
    accent: "text-accent",
    success: "text-success",
    warning: "text-warning",
  };

  return (
    <div className={`flex flex-col ${reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-12 items-center`}>
      {/* Category Info */}
      <div className="flex-1 text-center lg:text-left">
        <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl border ${accentClasses[accent]} mb-4`}>
          <CategoryIcon className="w-5 h-5" />
          <span className="font-semibold">{title}</span>
        </div>
        <p className="text-xl text-muted-foreground mb-6">{description}</p>
        
        {/* Feature List */}
        <div className="space-y-4">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-lg ${iconBgClasses[accent]} flex items-center justify-center flex-shrink-0`}>
                <feature.icon className={`w-5 h-5 ${iconTextClasses[accent]}`} />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Placeholder */}
      <div className="flex-1 w-full max-w-lg">
        <div className={`aspect-square rounded-3xl ${iconBgClasses[accent]} border-2 border-dashed ${accentClasses[accent].split(' ')[2]} flex items-center justify-center`}>
          <CategoryIcon className={`w-32 h-32 ${iconTextClasses[accent]} opacity-30`} />
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
