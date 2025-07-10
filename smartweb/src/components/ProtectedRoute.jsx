// components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("firebase_id_token");
    return token ? children : <Navigate to="/login" replace />;
};
