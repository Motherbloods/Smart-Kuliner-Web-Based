import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

  // Set default activeMenu setelah userData tersedia
  useEffect(() => {
    if (userData && isInitialized) {
      setActiveMenu(userData.seller ? "dashboard" : "products");
    }
  }, [userData, isInitialized]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        // Close dropdown (opsional)
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tampilkan loading state sampai auth selesai diinisialisasi dan userData tersedia
  if (!isInitialized || loading || (isInitialized && !userData)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-gray-600 text-lg">Memuat data pengguna...</div>
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
      />
      <Navbar activeMenu={activeMenu} isSidebarOpen={isSidebarOpen} />
      <PageContent activeMenu={activeMenu} isSidebarOpen={isSidebarOpen} />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
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

          {/* Protected Routes */}
          <Route
            path="/product-search"
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <ProductSearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}