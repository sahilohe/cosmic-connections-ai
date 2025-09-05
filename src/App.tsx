import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CreditsProvider } from "./contexts/CreditsContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Navigation } from "./components/Navigation";
import { DeveloperCreditsPanel } from "./components/DeveloperCreditsPanel";
import Landing from "./pages/Landing";
import Solo from "./pages/Solo";
import Compatibility from "./pages/Compatibility";
import Soulmate from "./pages/Soulmate";
import BuyCredits from "./pages/BuyCredits";
import Test from "./pages/Test";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CreditsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-gradient-cosmic">
              <Navigation />
              <DeveloperCreditsPanel />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/solo" element={<Solo />} />
                <Route path="/test" element={<Test />} />
                <Route path="/compatibility" element={<Compatibility />} />
                <Route path="/soulmate" element={<Soulmate />} />
                <Route path="/buy-credits" element={<BuyCredits />} />
                <Route path="/account" element={<div className="min-h-screen flex items-center justify-center pt-16"><h1 className="text-2xl">Account - Coming Soon</h1></div>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </CreditsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
