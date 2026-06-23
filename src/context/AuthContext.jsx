import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { auth } from '../config/firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'

const AuthContext = createContext(null)

// Email → role mapping
const EMAIL_ROLES = {
  'bu@boss.uz': 'super_admin',
  'bu@admin.uz': 'limited_admin'
}

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [autoLogoutEnabled, setAutoLogoutEnabled] = useState(
    () => localStorage.getItem('crm_auto_logout_enabled') === 'true'
  )
  const [autoLogoutMinutes, setAutoLogoutMinutes] = useState(
    () => Number(localStorage.getItem('crm_auto_logout_minutes')) || 5
  )

  const lastActivityRef = useRef(Date.now())

  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now()
  }, [])

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const role = EMAIL_ROLES[firebaseUser.email] || 'limited_admin'
        setCurrentUser({ email: firebaseUser.email, role })
        setIsLoggedIn(true)
      } else {
        setCurrentUser(null)
        setIsLoggedIn(false)
      }
      setAuthLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // Auto-logout logic
  useEffect(() => {
    if (!isLoggedIn || !autoLogoutEnabled) return

    const events = ['mousedown', 'keydown', 'scroll', 'mousemove', 'touchstart']
    events.forEach(e => document.addEventListener(e, updateActivity, { passive: true }))

    const interval = setInterval(() => {
      const inactiveMs = Date.now() - lastActivityRef.current
      if (inactiveMs / 60000 >= autoLogoutMinutes) {
        logout()
      }
    }, 30_000)

    return () => {
      clearInterval(interval)
      events.forEach(e => document.removeEventListener(e, updateActivity))
    }
  }, [isLoggedIn, autoLogoutEnabled, autoLogoutMinutes, updateActivity])

  // Persist settings
  useEffect(() => {
    localStorage.setItem('crm_auto_logout_enabled', autoLogoutEnabled ? 'true' : 'false')
  }, [autoLogoutEnabled])

  useEffect(() => {
    localStorage.setItem('crm_auto_logout_minutes', autoLogoutMinutes.toString())
  }, [autoLogoutMinutes])

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      lastActivityRef.current = Date.now()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.code }
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  const isSuperAdmin = () => currentUser?.role === 'super_admin'
  const canDelete = () => currentUser?.role === 'super_admin'

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      login,
      logout,
      currentUser,
      authLoading,
      isSuperAdmin,
      canDelete,
      autoLogoutEnabled,
      setAutoLogoutEnabled,
      autoLogoutMinutes,
      setAutoLogoutMinutes,
      updateActivity
    }}>
      {!authLoading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
