import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const OnboardingContext = createContext(null)

export function OnboardingProvider({ children }) {
  const { currentUser } = useAuth()
  const [tourCompleted, setTourCompleted] = useState(false)
  const [runTour, setRunTour] = useState(false)

  // localStorage dan tour holatini foydalanuvchi emailiga bog'lab o'qib olish
  useEffect(() => {
    if (!currentUser) {
      // Foydalanuvchi kirmagan bo'lsa, hech narsa qilmaslik
      setTourCompleted(false)
      setRunTour(false)
      return
    }

    // Foydalanuvchi emailiga mos keluvchi kalit yaratish
    const storageKey = `onboarding_completed_${currentUser.email}`
    const completed = localStorage.getItem(storageKey)
    
    if (completed === 'true') {
      setTourCompleted(true)
      setRunTour(false)
    } else {
      setTourCompleted(false)
      // Sahifa yuklangandan keyin 2 soniyadan keyin tourni boshlash
      const timer = setTimeout(() => {
        setRunTour(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [currentUser])

  const finishTour = () => {
    if (!currentUser) return
    
    const storageKey = `onboarding_completed_${currentUser.email}`
    setTourCompleted(true)
    setRunTour(false)
    localStorage.setItem(storageKey, 'true')
  }

  const restartTour = () => {
    if (!currentUser) return
    
    const storageKey = `onboarding_completed_${currentUser.email}`
    setTourCompleted(false)
    localStorage.removeItem(storageKey)
    
    // Tourni darhol boshlash
    setTimeout(() => {
      setRunTour(true)
    }, 100)
  }

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
  )
}

export function useOnboarding() {
  return useContext(OnboardingContext)
}
