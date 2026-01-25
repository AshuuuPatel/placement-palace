import { TrendingUp, Users, Building2, Award } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "50,000+",
    label: "Students Placed",
    color: "text-accent",
  },
  {
    icon: Building2,
    value: "500+",
    label: "Partner Companies",
    color: "text-success",
  },
  {
    icon: TrendingUp,
    value: "95%",
    label: "Placement Rate",
    color: "text-warning",
  },
  {
    icon: Award,
    value: "₹12 LPA",
    label: "Average Package",
    color: "text-accent",
  },
];

const StatsSection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="group relative p-6 lg:p-8 rounded-2xl gradient-card border border-border shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-3xl lg:text-4xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
