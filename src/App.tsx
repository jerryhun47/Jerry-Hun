/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthProvider';
import Layout from './components/Layout';
import Home from './pages/Home';
import ToolsStore from './pages/ToolsStore';
import Courses from './pages/Courses';
import Prompts from './pages/Prompts';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import Refund from './pages/Refund';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import { useVisitorTracking } from './lib/useVisitorTracking';

import { useLocation } from 'react-router-dom';

function GlobalTracker() {
  const location = useLocation();
  useVisitorTracking(location.pathname);
  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center p-4"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div></div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <GlobalTracker />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="tools" element={<ToolsStore />} />
            <Route path="courses" element={<Courses />} />
            <Route path="prompts" element={<Prompts />} />
            <Route path="refund" element={<Refund />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms-conditions" element={<TermsConditions />} />
          </Route>
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
