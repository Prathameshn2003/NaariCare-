import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Calendar, Activity, Thermometer, Heart, MessageCircle, ChevronRight, Droplets,
  Stethoscope, Building2, FileText, BookOpen, Sparkles, HelpCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const healthCards = [
  {
    title: "Menstrual Health",
    status: "Day 14 of Cycle",
    statusColor: "text-teal",
    icon: Droplets,
    iconBg: "bg-teal/20",
    iconColor: "text-teal",
    path: "/modules/menstrual",
    metric: "28 days",
    metricLabel: "Average Cycle",
  },
  {
    title: "PCOS Risk",
    status: "Low Risk",
    statusColor: "text-teal",
    icon: Activity,
    iconBg: "bg-accent/20",
    iconColor: "text-accent",
    path: "/modules/pcos",
    metric: "18%",
    metricLabel: "Risk Score",
  },
  {
    title: "Menopause Stage",
    status: "Not Applicable",
    statusColor: "text-muted-foreground",
    icon: Thermometer,
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
    path: "/modules/menopause",
    metric: "N/A",
    metricLabel: "Current Stage",
  },
];

const quickActions = [
  { icon: Calendar, label: "Log Period", path: "/modules/menstrual" },
  { icon: Activity, label: "Check PCOS", path: "/modules/pcos" },
  { icon: MessageCircle, label: "AI Chat", path: "/chatbot" },
  { icon: Heart, label: "Wellness", path: "/hygiene" },
];

const dashboardSections = [
  { icon: Stethoscope, title: "Find Doctors", description: "Connect with specialists", path: "/doctors", color: "text-teal", bgColor: "bg-teal/20" },
 
  { icon: FileText, title: "Govt. Schemes", description: "Explore health benefits", path: "/schemes", color: "text-accent", bgColor: "bg-accent/20" },
  { icon: BookOpen, title: "Health Resources", description: "Educational content", path: "/health-resources", color: "text-secondary-foreground", bgColor: "bg-secondary" },
  { icon: Sparkles, title: "Hygiene Tips", description: "Wellness guidance", path: "/hygiene", color: "text-teal", bgColor: "bg-teal/20" },
  {
  icon: MessageCircle,
  title: "AI Chat",
  description: "Instant health guidance with AI assistance",
  path: "/chatbot",
  color: "text-accent",
  bgColor: "bg-accent/20",
}

];

const Dashboard = () => {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  return (
    <DashboardLayout>
      <div className="mb-10">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
          Welcome back, {userName} 👋
        </h1>
        <p className="text-muted-foreground">Here's your health summary for today</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {quickActions.map((action) => (
          <Link key={action.label} to={action.path} className="glass-card rounded-xl p-4 flex flex-col items-center gap-3 hover:shadow-glow transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary transition-colors">
              <action.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
            </div>
            <span className="text-sm font-medium text-foreground">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {healthCards.map((card) => (
          <Link key={card.title} to={card.path} className="glass-card rounded-2xl p-6 hover:shadow-glow transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-foreground mb-1">{card.title}</h3>
            <p className={`text-sm font-medium ${card.statusColor} mb-4`}>{card.status}</p>
            <div className="pt-4 border-t border-border">
              <div className="text-2xl font-bold gradient-text">{card.metric}</div>
              <div className="text-xs text-muted-foreground">{card.metricLabel}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Dashboard Sections */}
      <div className="mb-10">
        <h2 className="font-heading text-xl font-semibold text-foreground mb-6">Explore Resources</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {dashboardSections.map((section) => (
            <Link key={section.title} to={section.path} className="glass-card rounded-xl p-4 hover:shadow-glow transition-all group text-center">
              <div className={`w-10 h-10 rounded-lg ${section.bgColor} flex items-center justify-center mx-auto mb-3`}>
                <section.icon className={`w-5 h-5 ${section.color}`} />
              </div>
              <h3 className="font-medium text-foreground text-sm mb-1">{section.title}</h3>
              <p className="text-xs text-muted-foreground">{section.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Cycle Overview */}
      <div className="glass-card rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-1">Cycle Overview</h2>
            <p className="text-sm text-muted-foreground">Track your menstrual health patterns</p>
          </div>
          <Link to="/modules/menstrual"><Button variant="outline" size="sm">View Details</Button></Link>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 28 }).map((_, i) => {
            const isCurrentDay = i === 13;
            const isPeriod = i < 5;
            const isOvulation = i >= 12 && i <= 16;
            return (
              <div key={i} className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium transition-all ${isCurrentDay ? "bg-accent text-accent-foreground ring-2 ring-accent ring-offset-2 ring-offset-background" : isPeriod ? "bg-primary/40 text-foreground" : isOvulation ? "bg-teal/30 text-foreground" : "bg-muted text-muted-foreground"}`}>
                {i + 1}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary/40" /><span className="text-xs text-muted-foreground">Period</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-teal/30" /><span className="text-xs text-muted-foreground">Ovulation Window</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-accent" /><span className="text-xs text-muted-foreground">Today</span></div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
