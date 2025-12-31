import { ReactNode, useEffect, useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardNavbar } from "./DashboardNavbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Lock body scroll on mobile when sidebar is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-background">

      {/* Navbar → TOGGLE sidebar */}
      <DashboardNavbar
        onMenuClick={() => setSidebarOpen(prev => !prev)}
      />

      {/* Sidebar */}
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="pt-16 lg:pl-64">
        <div className="min-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
