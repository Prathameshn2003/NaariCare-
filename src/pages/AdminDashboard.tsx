import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminDoctors } from "@/components/admin/AdminDoctors";
import { AdminNGOs } from "@/components/admin/AdminNGOs";
import { AdminSchemes } from "@/components/admin/AdminSchemes";
import { AdminHealthResources } from "@/components/admin/AdminHealthResources";
import { Shield, Users, Building2, FileText, BookOpen, LayoutDashboard } from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
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
              Manage platform content, doctors, NGOs, and government schemes
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="doctors" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Doctors</span>
              </TabsTrigger>
              <TabsTrigger value="ngos" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">NGOs</span>
              </TabsTrigger>
              <TabsTrigger value="schemes" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Schemes</span>
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Resources</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview"><AdminOverview /></TabsContent>
            <TabsContent value="doctors"><AdminDoctors /></TabsContent>
            <TabsContent value="ngos"><AdminNGOs /></TabsContent>
            <TabsContent value="schemes"><AdminSchemes /></TabsContent>
            <TabsContent value="resources"><AdminHealthResources /></TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;