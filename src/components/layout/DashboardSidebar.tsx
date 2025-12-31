import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Droplets,
  Activity,
  Thermometer,
  Apple,
  Stethoscope,
  Building2,
  FileText,
  Sparkles,
  MessageCircle,
  User,
  LogOut,
  Shield,
  Users,
  BookOpen,
} from "lucide-react";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const userNavItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Menstrual Health", path: "/modules/menstrual", icon: Droplets },
  { title: "PCOS Prediction", path: "/modules/pcos", icon: Activity },
  { title: "Menopause", path: "/modules/menopause", icon: Thermometer },
  { title: "Diet & Exercise", path: "/education", icon: Apple },
  { title: "Nearby Doctors", path: "/doctors", icon: Stethoscope },
  { title: "NGOs & Support", path: "/ngos", icon: Building2 },
  { title: "Govt. Schemes", path: "/schemes", icon: FileText },
  { title: "Health Resources", path: "/health-resources", icon: BookOpen },
  { title: "Hygiene & Wellness", path: "/hygiene", icon: Sparkles },
  { title: "AI Chatbot", path: "/chatbot", icon: MessageCircle },
  { title: "My Profile", path: "/profile", icon: User },
];

const adminNavItems = [
  { title: "Admin Dashboard", path: "/admin", icon: LayoutDashboard },
  { title: "Manage Users", path: "/admin/users", icon: Users },
  { title: "Health Resources", path: "/admin/resources", icon: BookOpen },
  { title: "Govt. Schemes", path: "/admin/schemes", icon: FileText },
  { title: "NGO Management", path: "/admin/ngos", icon: Building2 },
];

export const DashboardSidebar = ({
  isOpen,
  onClose,
}: DashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
    onClose();
  };

  const isActive = (path: string) =>
    path === "/dashboard"
      ? location.pathname === path
      : location.pathname.startsWith(path);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          `
          fixed top-16 left-0 z-50
          h-[calc(100vh-4rem)]
          w-[78vw] max-w-[280px]
          bg-background
          border-r
          flex flex-col
          transition-transform duration-300 ease-in-out
          shadow-xl
          `,
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:w-64 lg:shadow-none"
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b">
          <NavLink to="/" className="flex items-center gap-3">
            <img src="/favicon.png" className="w-9 h-9" />
            <span className="font-heading font-bold text-xl">
              Naari<span className="text-accent">Care</span>
            </span>
          </NavLink>
        </div>

        {/* Scrollable Nav */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {userNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition",
                isActive(item.path)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.title}
            </NavLink>
          ))}

          {isAdmin && (
            <div className="mt-6 pt-4 border-t">
              <p className="text-xs font-semibold uppercase mb-3 flex items-center gap-2 px-4">
                <Shield className="w-3 h-3" /> Admin
              </p>

              {adminNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm hover:bg-muted"
                >
                  <item.icon className="w-5 h-5" />
                  {item.title}
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        {/* 🔒 FIXED LOGOUT (ALWAYS VISIBLE) */}
        <div className="p-4 border-t">
          <p className="text-sm font-medium truncate">
            {user?.user_metadata?.full_name || "User"}
          </p>
          <p className="text-xs text-muted-foreground truncate mb-3">
            {user?.email}
          </p>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
};
