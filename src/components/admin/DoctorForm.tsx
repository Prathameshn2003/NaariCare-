import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string | null;
  location: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
}

interface DoctorFormProps {
  doctor?: Doctor | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const DoctorForm = ({ doctor, onSuccess, onCancel }: DoctorFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: doctor?.name || "",
    specialization: doctor?.specialization || "",
    hospital: doctor?.hospital || "",
    location: doctor?.location || "",
    phone: doctor?.phone || "",
    email: doctor?.email || "",
    description: doctor?.description || "",
    image_url: doctor?.image_url || "",
    is_active: doctor?.is_active ?? true,
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name,
      specialization: formData.specialization,
      hospital: formData.hospital || null,
      location: formData.location || null,
      phone: formData.phone || null,
      email: formData.email || null,
      description: formData.description || null,
      image_url: formData.image_url || null,
      is_active: formData.is_active,
    };

    let error;
    if (doctor?.id) {
      const result = await supabase
        .from('doctors')
        .update(payload)
        .eq('id', doctor.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('doctors')
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
        title: doctor ? "Updated" : "Created",
        description: `Doctor has been ${doctor ? "updated" : "added"} successfully`,
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
          {doctor ? "Edit Doctor" : "Add New Doctor"}
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
              Specialization *
            </label>
            <Input
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Hospital
            </label>
            <Input
              value={formData.hospital}
              onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
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
              Phone
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
            {doctor ? "Update Doctor" : "Add Doctor"}
          </Button>
        </div>
      </form>
    </div>
  );
};
