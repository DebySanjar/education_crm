import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Groups from './pages/Groups'
import Attendance from './pages/Attendance'
import Payments from './pages/Payments'
import Expenses from './pages/Expenses'
import Statistics from './pages/Statistics'
import Settings from './pages/Settings'
import Surveys from './pages/Surveys'
import SurveyPage from './pages/SurveyPage'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { ToastProvider } from './context/ToastContext'
import { OnboardingProvider } from './context/OnboardingContext'
import OnboardingTour from './components/OnboardingTour'

function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <>
      <OnboardingTour />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/survey/:id" element={<SurveyPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="groups" element={<Groups />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="payments" element={<Payments />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="surveys" element={<Surveys />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <DataProvider>
            {/* OnboardingProvider AuthProvider ichida bo'lishi kerak, chunki u useAuth dan foydalanadi */}
            <OnboardingProvider>
              <AppRoutes />
            </OnboardingProvider>
          </DataProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
