import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { NGOForm } from "./NGOForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

export const AdminNGOs = () => {
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNGO, setEditingNGO] = useState<NGO | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchNGOs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ngos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch NGOs",
        variant: "destructive",
      });
    } else {
      setNgos(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNGOs();
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;

    const { error } = await supabase
      .from('ngos')
      .delete()
      .eq('id', deletingId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete NGO",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deleted",
        description: "NGO has been removed",
      });
      fetchNGOs();
    }
    setDeletingId(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingNGO(null);
    fetchNGOs();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (showForm || editingNGO) {
    return (
      <NGOForm
        ngo={editingNGO}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowForm(false);
          setEditingNGO(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Manage NGOs ({ngos.length})
        </h2>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add NGO
        </Button>
      </div>

      {ngos.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <p className="text-muted-foreground">No NGOs added yet.</p>
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Focus Area</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ngos.map((ngo) => (
                <TableRow key={ngo.id}>
                  <TableCell className="font-medium">{ngo.name}</TableCell>
                  <TableCell>{ngo.focus_area || "-"}</TableCell>
                  <TableCell>{ngo.location || "-"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      ngo.is_active 
                        ? "bg-teal/20 text-teal" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {ngo.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingNGO(ngo)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingId(ngo.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete NGO</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this NGO? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
