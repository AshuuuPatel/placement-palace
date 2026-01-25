import { Button } from "@/components/ui/button";
import { GraduationCap, Building2, Users } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/50 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTh2Mkg0djEyaDJ2Mkg0di04aDJWMjZ6TTI0IDE0aDEydjJIMjR2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

      <div className="container relative z-10 mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-accent mb-8 animate-fade-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-sm font-medium">Streamline Your Campus Placements</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            College Placement
            <span className="block text-gradient mt-2">Management System</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Connect students with their dream careers. Empower placement cells with powerful tools. 
            Help companies find the best talent—all in one unified platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl">
              Get Started
            </Button>
            <Button variant="hero-outline" size="xl">
              Watch Demo
            </Button>
          </div>

          {/* User Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <UserTypeCard
              icon={GraduationCap}
              title="Students"
              description="Apply to jobs, track applications, and build your career profile"
            />
            <UserTypeCard
              icon={Users}
              title="Placement Cell"
              description="Manage drives, coordinate schedules, and track placement metrics"
            />
            <UserTypeCard
              icon={Building2}
              title="Companies"
              description="Post opportunities, screen candidates, and hire top talent"
            />
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
        </svg>
      </div>
    </section>
  );
};

interface UserTypeCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const UserTypeCard = ({ icon: Icon, title, description }: UserTypeCardProps) => {
  return (
    <div className="group p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-all duration-300 hover:-translate-y-1">
      <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center mb-4 mx-auto group-hover:bg-accent/30 transition-colors">
        <Icon className="w-7 h-7 text-accent" />
      </div>
      <h3 className="text-lg font-semibold text-primary-foreground mb-2">{title}</h3>
      <p className="text-sm text-primary-foreground/70">{description}</p>
    </div>
  );
};

export default HeroSection;
