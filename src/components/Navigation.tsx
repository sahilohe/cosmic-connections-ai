import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CreditBadge } from "./CreditBadge";
import { Stars, User, Menu } from "lucide-react";
import { useCredits } from "@/contexts/CreditsContext";

export function Navigation() {
  const location = useLocation();
  const { credits } = useCredits();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="p-2 bg-gradient-stellar rounded-lg shadow-cosmic group-hover:animate-pulse">
            <Stars className="w-6 h-6 text-primary-foreground animate-twinkle" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Astral Lab
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link 
            to="/solo" 
            className={`text-sm font-medium transition-colors hover:text-accent ${
              isActive('/solo') ? 'text-accent' : 'text-muted-foreground'
            }`}
          >
            Birth Chart
          </Link>
          <Link 
            to="/compatibility" 
            className={`text-sm font-medium transition-colors hover:text-accent ${
              isActive('/compatibility') ? 'text-accent' : 'text-muted-foreground'
            }`}
          >
            Compatibility
          </Link>
          <Link 
            to="/soulmate" 
            className={`text-sm font-medium transition-colors hover:text-accent ${
              isActive('/soulmate') ? 'text-accent' : 'text-muted-foreground'
            }`}
          >
            Soulmate
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          <CreditBadge credits={credits} />
          <Button variant="ghost" size="icon" className="hover:bg-accent/10">
            <User className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}