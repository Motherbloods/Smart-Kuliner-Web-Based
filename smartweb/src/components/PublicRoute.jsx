// components/PublicRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

export const PublicRoute = ({ children }) => {
    const token = localStorage.getItem("firebase_id_token"); // atau sessionStorage
    return token ? <Navigate to="/" replace /> : children;
};
