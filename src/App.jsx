import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './layouts/DashboardLayout'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { ToastProvider } from './context/ToastContext'

const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const Students = React.lazy(() => import('./pages/Students'))
const Groups = React.lazy(() => import('./pages/Groups'))
const Attendance = React.lazy(() => import('./pages/Attendance'))
const Payments = React.lazy(() => import('./pages/Payments'))
const Expenses = React.lazy(() => import('./pages/Expenses'))
const Statistics = React.lazy(() => import('./pages/Statistics'))
const Settings = React.lazy(() => import('./pages/Settings'))
const SurveysList = React.lazy(() => import('./pages/SurveysList'))
const SurveySubmissions = React.lazy(() => import('./pages/SurveySubmissions'))
const SurveyPage = React.lazy(() => import('./pages/SurveyPage'))

function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/survey/:id" 
          element={
            <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#e2e8f0' }}>Yuklanmoqda...</div>}>
              <SurveyPage />
            </Suspense>
          } 
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={
            <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 70px)', color: '#e2e8f0' }}>Yuklanmoqda...</div>}>
              <Dashboard />
            </Suspense>
          } />
          <Route path="students" element={
            <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 70px)', color: '#e2e8f0' }}>Yuklanmoqda...</div>}>
              <Students />
            </Suspense>
          } />
          <Route path="groups" element={
            <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 70px)', color: '#e2e8f0' }}>Yuklanmoqda...</div>}>
              <Groups />
            </Suspense>
          } />
          <Route path="attendance" element={
            <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 70px)', color: '#e2e8f0' }}>Yuklanmoqda...</div>}>
              <Attendance />
            </Suspense>
          } />
          <Route path="payments" element={
            <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 70px)', color: '#e2e8f0' }}>Yuklanmoqda...</div>}>
              <Payments />
            </Suspense>
          } />
          <Route path="expenses" element={
            <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 70px)', color: '#e2e8f0' }}>Yuklanmoqda...</div>}>
              <Expenses />
            </Suspense>
          } />
          <Route path="surveys" element={
            <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 70px)', color: '#e2e8f0' }}>Yuklanmoqda...</div>}>
              <SurveysList />
            </Suspense>
          } />
          <Route path="surveys/submissions" element={
            <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 70px)', color: '#e2e8f0' }}>Yuklanmoqda...</div>}>
              <SurveySubmissions />
            </Suspense>
          } />
          <Route path="statistics" element={
            <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 70px)', color: '#e2e8f0' }}>Yuklanmoqda...</div>}>
              <Statistics />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 70px)', color: '#e2e8f0' }}>Yuklanmoqda...</div>}>
              <Settings />
            </Suspense>
          } />
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
            <AppRoutes />
          </DataProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
