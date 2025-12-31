import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { Shield } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const AdminIndex = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex pt-20">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-destructive" />
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage platform content, users, NGOs, and government schemes
            </p>
          </div>
          <AdminOverview />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminIndex;
