import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, BookOpen, FileText, Building2, Loader2, TrendingUp } from "lucide-react";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalNGOs: number;
  totalSchemes: number;
  totalResources: number;
  publishedResources: number;
  activeSchemes: number;
}

export const AdminOverview = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      const [profilesRes, ngosRes, schemesRes, resourcesRes] = await Promise.all([
        supabase.from('profiles').select('id, created_at'),
        supabase.from('ngos').select('id, is_active'),
        supabase.from('schemes').select('id, is_active'),
        supabase.from('health_resources').select('id, status, is_active'),
      ]);

      // Calculate active users (users who registered in last 30 days as proxy)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeUsersCount = profilesRes.data?.filter(p => 
        new Date(p.created_at) > thirtyDaysAgo
      ).length || 0;

      setStats({
        totalUsers: profilesRes.data?.length || 0,
        activeUsers: activeUsersCount,
        totalNGOs: ngosRes.data?.length || 0,
        totalSchemes: schemesRes.data?.length || 0,
        totalResources: resourcesRes.data?.length || 0,
        publishedResources: resourcesRes.data?.filter(r => r.status === 'Published').length || 0,
        activeSchemes: schemesRes.data?.filter(s => s.is_active).length || 0,
      });
      
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      subtitle: `${stats?.activeUsers || 0} active this month`,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/20",
    },
    {
      title: "Health Resources",
      value: stats?.totalResources || 0,
      subtitle: `${stats?.publishedResources || 0} published`,
      icon: BookOpen,
      color: "text-teal",
      bgColor: "bg-teal/20",
    },
    {
      title: "Government Schemes",
      value: stats?.totalSchemes || 0,
      subtitle: `${stats?.activeSchemes || 0} active`,
      icon: FileText,
      color: "text-accent",
      bgColor: "bg-accent/20",
    },
    {
      title: "NGOs",
      value: stats?.totalNGOs || 0,
      subtitle: "Support organizations",
      icon: Building2,
      color: "text-secondary-foreground",
      bgColor: "bg-secondary",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
          Dashboard Overview
        </h2>
        <p className="text-muted-foreground text-sm">
          Quick summary of platform content and statistics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="glass-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Use the sidebar to manage users, resources, schemes, and NGOs.
            </p>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• View and manage registered users</li>
              <li>• Add or edit health education resources</li>
              <li>• Update government health schemes</li>
              <li>• Manage NGO listings and support organizations</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Platform Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Content Status</span>
              <span className="text-sm font-medium text-teal">Active</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Database</span>
              <span className="text-sm font-medium text-teal">Connected</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Role</span>
              <span className="text-sm font-medium text-accent">Administrator</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
