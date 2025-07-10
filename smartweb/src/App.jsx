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

const DashboardLayout = () => {
  const [activeMenu, setActiveMenu] = useState("products");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        // Close dropdowns (optional)
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <Route
          path="/product-search"
          element={
            <ProtectedRoute>
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
      </Routes>
    </Router>
  );
}
