import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { RegisterSellerPage } from "./pages/RegisterSeller";
import { Navbar } from "./components/layouts/Navbar";
import { PageContent } from "./pages/PageContent";
import { Sidebar } from "./components/layouts/Sidebar";
import ProductSearchPage from "./pages/ProductSearch";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./hooks/useAuth";

const DashboardLayout = () => {
  const { userData, loading, isInitialized } = useAuth();
  const [activeMenu, setActiveMenu] = useState("products");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Set default activeMenu based on user role
  useEffect(() => {
    if (isInitialized) {
      if (userData?.seller) {
        setActiveMenu("dashboard");
      } else {
        setActiveMenu("products");
      }
    }
  }, [userData, isInitialized]);

  // Handle mobile menu toggle
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        // Close dropdown (optional)
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show loading only while auth is initializing
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-b-2 border-blue-600"></div>
          <div className="text-gray-600 text-sm lg:text-lg text-center">Memuat aplikasi...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        onToggle={setIsSidebarOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={handleMobileMenuToggle}
      />
      <Navbar
        activeMenu={activeMenu}
        isSidebarOpen={isSidebarOpen}
        onMobileMenuToggle={handleMobileMenuToggle}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      <PageContent activeMenu={activeMenu} isSidebarOpen={isSidebarOpen} />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes - Only accessible when not logged in */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register-seller"
            element={
              <PublicRoute>
                <RegisterSellerPage />
              </PublicRoute>
            }
          />
          <Route
            path="/product-search"
            element={
              <ProtectedRoute allowedRoles={['buyer', 'guest']}>
                <ProductSearchPage />
              </ProtectedRoute>
            }
          />

          {/* Main Dashboard Routes - Accessible by everyone (including guests) */}
          <Route
            path="/"
            element={<DashboardLayout />}
          />
          <Route
            path="/dashboard"
            element={<DashboardLayout />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}