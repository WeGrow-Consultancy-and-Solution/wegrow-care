/**
 * @license
 * SPDX-License-Identifier: Apache-2.0 Hello
 */


import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AppProvider, useAppContext } from "./contexts/AppContext";
import { CartProvider } from "./contexts/CartContext";
import { Layout } from "./components/layout/Layout";

// Lazy loaded components
const Welcome = lazy(() => import("./pages/Welcome").then(module => ({ default: module.Welcome })));
const Home = lazy(() => import("./pages/Home").then(module => ({ default: module.Home })));
const Services = lazy(() => import("./pages/Services").then(module => ({ default: module.Services })));
const ServiceDetails = lazy(() => import("./pages/ServiceDetails").then(module => ({ default: module.ServiceDetails })));
const Booking = lazy(() => import("./pages/Booking").then(module => ({ default: module.Booking })));
const Checkout = lazy(() => import("./pages/Checkout").then(module => ({ default: module.Checkout })));
const Confirmation = lazy(() => import("./pages/Confirmation").then(module => ({ default: module.Confirmation })));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard").then(module => ({ default: module.ClientDashboard })));
const ProviderDashboard = lazy(() => import("./pages/ProviderDashboard").then(module => ({ default: module.ProviderDashboard })));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard").then(module => ({ default: module.AdminDashboard })));
const Profile = lazy(() => import("./pages/Profile").then(module => ({ default: module.Profile })));

// Loading Skeleton Placeholder
const PageLoader = () => (
  <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      <p className="text-slate-600 text-sm font-medium animate-pulse">Initializing Care Experience...</p>
    </div>
  </div>
);

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const { currentUser, loading } = useAppContext();
  
  if (loading) {
    return <PageLoader />;
  }
  
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  
  if (!allowedRoles.includes(currentUser.role)) {
    if (currentUser.role === 'pending_provider') {
      return <Navigate to="/provider-dashboard" replace />;
    }
    return <Navigate to={`/${currentUser.role}-dashboard`} replace />;
  }
  
  return <>{children}</>;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        {/* Login page for providers/admins or anyone who wants to sign in directly */}
        <Route 
          path="/login" 
          element={
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="h-screen w-full"
            >
              <Welcome />
            </motion.div>
          } 
        />

        {/* Main app — all public pages live under Layout */}
        <Route 
          path="/" 
          element={
            <motion.div
              key="app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="min-h-screen w-full flex flex-col"
            >
              <Layout />
            </motion.div>
          }
        >
          {/* Public routes — anyone can browse */}
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="services/:id" element={<ServiceDetails />} />
          <Route path="booking" element={<Booking />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="confirmation" element={<Confirmation />} />
          
          {/* Protected Dashboard Routes */}
          <Route 
            path="client-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="provider-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['provider', 'pending_provider']}>
                <ProviderDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="admin-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="profile" 
            element={
              <ProtectedRoute allowedRoles={['client', 'provider', 'pending_provider', 'admin']}>
                <Profile />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Legacy /app routes redirect to new root */}
        <Route path="/app/*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AppProvider>
      <CartProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <AnimatedRoutes />
          </Suspense>
        </BrowserRouter>
      </CartProvider>
    </AppProvider>
  );
}
