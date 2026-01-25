import { UserPlus, FileSearch, Handshake, Trophy } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Register & Create Profile",
    description: "Students sign up and build comprehensive profiles. Companies and placement cells get verified accounts.",
  },
  {
    icon: FileSearch,
    step: "02",
    title: "Discover Opportunities",
    description: "Browse and filter placement drives. Students apply to matching roles while companies review applications.",
  },
  {
    icon: Handshake,
    step: "03",
    title: "Interview & Select",
    description: "Schedule interviews, conduct assessments, and shortlist candidates through our streamlined process.",
  },
  {
    icon: Trophy,
    step: "04",
    title: "Get Placed!",
    description: "Receive offers, accept positions, and celebrate successful placements with detailed analytics.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Process
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            A simple, streamlined process to connect talent with opportunities
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div key={item.step} className="relative group">
                {/* Step Card */}
                <div className="p-6 rounded-2xl bg-card border border-border shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  {/* Step Number */}
                  <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-bold">
                    {item.step}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 mt-2 group-hover:bg-accent/10 transition-colors">
                    <item.icon className="w-8 h-8 text-accent" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>

                {/* Arrow (hidden on last item and mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-20 -right-4 z-10">
                    <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
