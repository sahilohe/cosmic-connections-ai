import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CreditBadgeProps {
  credits: number;
  className?: string;
}

export function CreditBadge({ credits, className }: CreditBadgeProps) {
  return (
    <Badge 
      variant="secondary" 
      className={`bg-gradient-nebula text-foreground border-accent/20 shadow-nebula animate-pulse-glow ${className}`}
    >
      <Sparkles className="w-3 h-3 mr-1 animate-twinkle" />
      {credits} Credits
    </Badge>
  );
}