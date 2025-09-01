import React, { createContext, useContext, useState, useEffect } from 'react';

interface CreditsContextType {
  credits: number;
  deductCredits: (amount: number) => boolean;
  addCredits: (amount: number) => void;
  resetCredits: () => void;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const [credits, setCredits] = useState<number>(5); // Start with 5 free credits

  // Load credits from localStorage on mount
  useEffect(() => {
    const savedCredits = localStorage.getItem('cosmic-connections-credits');
    if (savedCredits !== null) {
      setCredits(parseInt(savedCredits, 10));
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
      resetCredits
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
