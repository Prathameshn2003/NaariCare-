import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminNGOs } from "@/components/admin/AdminNGOs";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const AdminNGOsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex pt-20">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <AdminNGOs />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminNGOsPage;
