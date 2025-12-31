import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

interface NGO {
  id: string;
  name: string;
  description: string | null;
  focus_area: string | null;
  location: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  image_url: string | null;
  is_active: boolean;
}

interface NGOFormProps {
  ngo?: NGO | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const NGOForm = ({ ngo, onSuccess, onCancel }: NGOFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: ngo?.name || "",
    description: ngo?.description || "",
    focus_area: ngo?.focus_area || "",
    location: ngo?.location || "",
    contact_email: ngo?.contact_email || "",
    contact_phone: ngo?.contact_phone || "",
    website: ngo?.website || "",
    image_url: ngo?.image_url || "",
    is_active: ngo?.is_active ?? true,
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name,
      description: formData.description || null,
      focus_area: formData.focus_area || null,
      location: formData.location || null,
      contact_email: formData.contact_email || null,
      contact_phone: formData.contact_phone || null,
      website: formData.website || null,
      image_url: formData.image_url || null,
      is_active: formData.is_active,
    };

    let error;
    if (ngo?.id) {
      const result = await supabase
        .from('ngos')
        .update(payload)
        .eq('id', ngo.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('ngos')
        .insert(payload);
      error = result.error;
    }

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: ngo ? "Updated" : "Created",
        description: `NGO has been ${ngo ? "updated" : "added"} successfully`,
      });
      onSuccess();
    }
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="font-heading text-xl font-semibold text-foreground">
          {ngo ? "Edit NGO" : "Add New NGO"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Focus Area
            </label>
            <Input
              value={formData.focus_area}
              onChange={(e) => setFormData({ ...formData, focus_area: e.target.value })}
              placeholder="e.g., Women's Health, Reproductive Rights"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Location
            </label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Contact Email
            </label>
            <Input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Contact Phone
            </label>
            <Input
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Website
            </label>
            <Input
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Image URL
          </label>
          <Input
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Description
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <label className="text-sm text-foreground">Active</label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {ngo ? "Update NGO" : "Add NGO"}
          </Button>
        </div>
      </form>
    </div>
  );
};
