import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface DashboardNavbarProps {
  onMenuClick: () => void;
}

export const DashboardNavbar = ({ onMenuClick }: DashboardNavbarProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 bg-background border-b">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2 select-none">
          <img
            src="/favicon.png"
            alt="NaariCare logo"
            className="w-8 h-8 object-contain"
          />
          <span className="font-heading font-bold text-lg leading-none">
            Naari<span className="text-accent">Care</span>
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">

          {/* Desktop Logout (icon + text) */}
          <Button
            variant="ghost"
            className="hidden lg:flex items-center gap-2 text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>

          {/* Mobile Menu */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation menu"
            onClick={onMenuClick}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </header>
  );
};
