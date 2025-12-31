import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardNavbarProps {
  onMenuClick: () => void;
}

export const DashboardNavbar = ({ onMenuClick }: DashboardNavbarProps) => {
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

        {/* Menu Button (mobile only) */}
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
    </header>
  );
};
