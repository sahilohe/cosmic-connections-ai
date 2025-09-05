import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Stars, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Track 404 errors for analytics if needed
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-cosmic pt-16">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8 animate-float">
          <Stars className="w-20 h-20 mx-auto text-accent animate-twinkle" />
        </div>
        
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          404
        </h1>
        
        <h2 className="text-2xl font-semibold mb-4 text-foreground">
          Lost in Space
        </h2>
        
        <p className="text-lg text-muted-foreground mb-8">
          The cosmic path you're seeking doesn't exist in our galaxy.
        </p>
        
        <Button variant="stellar" size="lg" asChild>
          <Link to="/">
            <Home className="w-4 h-4 mr-2" />
            Return to Earth
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
