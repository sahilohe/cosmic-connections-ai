import React, { createContext, useContext, useState, useEffect } from 'react';

interface CreditsContextType {
  credits: number;
  deductCredits: (amount: number) => boolean;
  addCredits: (amount: number) => void;
  resetCredits: () => void;
  // Developer functions
  setCredits: (amount: number) => void;
  isDeveloper: boolean;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const [credits, setCredits] = useState<number>(5); // Start with 5 free credits
  
  // Check if user is in developer mode
  const isDeveloper = import.meta.env.DEV || localStorage.getItem('cosmic-connections-dev-mode') === 'true';

  // Load credits from localStorage on mount
  useEffect(() => {
    const savedCredits = localStorage.getItem('cosmic-connections-credits');
    if (savedCredits !== null) {
      const parsedCredits = parseInt(savedCredits, 10);
      // If user has less than 5 credits, give them 5 (for existing users)
      if (parsedCredits < 5) {
        setCredits(5);
      } else {
        setCredits(parsedCredits);
      }
    }
  }, []);

  // Save credits to localStorage whenever credits change
  useEffect(() => {
    localStorage.setItem('cosmic-connections-credits', credits.toString());
  }, [credits]);

  const deductCredits = (amount: number): boolean => {
    if (credits >= amount) {
      setCredits(prev => prev - amount);
      return true;
    }
    return false;
  };

  const addCredits = (amount: number) => {
    setCredits(prev => prev + amount);
  };

  const resetCredits = () => {
    setCredits(5); // Reset to 5 free credits
  };

  return (
    <CreditsContext.Provider value={{
      credits,
      deductCredits,
      addCredits,
      resetCredits,
      setCredits,
      isDeveloper
    }}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditsProvider');
  }
  return context;
}
