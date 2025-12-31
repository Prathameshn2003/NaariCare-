import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, FileText, ExternalLink, CheckCircle } from "lucide-react";

interface Scheme {
  id: string;
  name: string;
  description: string | null;
  eligibility: string | null;
  benefits: string | null;
  how_to_apply: string | null;
  website: string | null;
  category: string | null;
}

const Schemes = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchemes = async () => {
      const { data, error } = await supabase
        .from('schemes')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (!error && data) {
        setSchemes(data);
        setFilteredSchemes(data);
      }
      setLoading(false);
    };

    fetchSchemes();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredSchemes(
        schemes.filter(s =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredSchemes(schemes);
    }
  }, [searchQuery, schemes]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                Government Schemes
              </h1>
            </div>
            <p className="text-muted-foreground">
              Explore government health schemes and benefits for women
            </p>
          </div>

          <div className="relative max-w-md mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search schemes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : filteredSchemes.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <p className="text-muted-foreground">
                {schemes.length === 0 ? "No schemes available at the moment." : "No schemes match your search."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSchemes.map((scheme) => (
                <div 
                  key={scheme.id} 
                  className="glass-card rounded-xl overflow-hidden hover:shadow-glow transition-all"
                >
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === scheme.id ? null : scheme.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {scheme.category && (
                            <span className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
                              {scheme.category}
                            </span>
                          )}
                        </div>
                        <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                          {scheme.name}
                        </h3>
                        {scheme.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {scheme.description}
                          </p>
                        )}
                      </div>
                      <FileText className="w-8 h-8 text-accent flex-shrink-0" />
                    </div>
                  </div>

                  {expandedId === scheme.id && (
                    <div className="px-6 pb-6 pt-2 border-t border-border space-y-4">
                      {scheme.eligibility && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-teal" />
                            Eligibility
                          </h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {scheme.eligibility}
                          </p>
                        </div>
                      )}

                      {scheme.benefits && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-teal" />
                            Benefits
                          </h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {scheme.benefits}
                          </p>
                        </div>
                      )}

                      {scheme.how_to_apply && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-teal" />
                            How to Apply
                          </h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {scheme.how_to_apply}
                          </p>
                        </div>
                      )}

                      {scheme.website && (
                        <Button variant="outline" size="sm" className="gap-2 mt-4" asChild>
                          <a href={scheme.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                            Official Website
                          </a>
                        </Button>
                      )}
                    </div>
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

export default Schemes;
