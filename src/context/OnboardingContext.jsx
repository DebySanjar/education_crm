import React, { createContext, useContext, useState, useEffect } from 'react';

const OnboardingContext = createContext();

export function OnboardingProvider({ children }) {
  const [tourCompleted, setTourCompleted] = useState(false);
  const [runTour, setRunTour] = useState(false);

  // localStorage dan tour holatini o'qib olish
  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed');
    if (completed === 'true') {
      setTourCompleted(true);
    } else {
      // Sahifa yuklangandan keyin 2 soniyadan keyin tourni boshlash
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const finishTour = () => {
    setTourCompleted(true);
    setRunTour(false);
    localStorage.setItem('onboarding_completed', 'true');
  };

  const restartTour = () => {
    setTourCompleted(false);
    setRunTour(true);
    localStorage.removeItem('onboarding_completed');
  };

  return (
    <OnboardingContext.Provider value={{
      tourCompleted,
      runTour,
      setRunTour,
      finishTour,
      restartTour
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}
