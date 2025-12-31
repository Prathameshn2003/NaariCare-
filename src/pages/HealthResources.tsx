import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, BookOpen, ExternalLink } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HealthResource {
  id: string;
  title: string;
  category: string;
  description: string | null;
  external_link: string | null;
}

const HealthResources = () => {
  const [resources, setResources] = useState<HealthResource[]>([]);
  const [filteredResources, setFilteredResources] = useState<HealthResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const fetchResources = async () => {
      const { data, error } = await supabase
        .from('health_resources')
        .select('*')
        .eq('status', 'Published')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setResources(data);
        setFilteredResources(data);
      }
      setLoading(false);
    };

    fetchResources();
  }, []);

  useEffect(() => {
    let filtered = resources;
    
    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (categoryFilter !== "all") {
      filtered = filtered.filter(r => r.category === categoryFilter);
    }
    
    setFilteredResources(filtered);
  }, [searchQuery, categoryFilter, resources]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Menstrual': return 'bg-primary/20 text-primary';
      case 'PCOS': return 'bg-accent/20 text-accent';
      case 'Menopause': return 'bg-teal/20 text-teal';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-secondary-foreground" />
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                Health Resources
              </h1>
            </div>
            <p className="text-muted-foreground">
              Educational content and resources for women's health
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Menstrual">Menstrual</SelectItem>
                <SelectItem value="PCOS">PCOS</SelectItem>
                <SelectItem value="Menopause">Menopause</SelectItem>
                <SelectItem value="General Wellness">General Wellness</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <p className="text-muted-foreground">
                {resources.length === 0 ? "No health resources available at the moment." : "No resources match your filters."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <div key={resource.id} className="glass-card rounded-xl p-6 hover:shadow-glow transition-all flex flex-col">
                  <div className="mb-4">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryColor(resource.category)}`}>
                      {resource.category}
                    </span>
                  </div>
                  
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-3">
                    {resource.title}
                  </h3>
                  
                  {resource.description && (
                    <p className="text-sm text-muted-foreground mb-4 flex-1">
                      {resource.description}
                    </p>
                  )}

                  {resource.external_link && (
                    <Button variant="outline" size="sm" className="gap-2 w-fit mt-auto" asChild>
                      <a href={resource.external_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                        Learn More
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HealthResources;
