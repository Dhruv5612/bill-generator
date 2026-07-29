import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element }) => {
  const token = sessionStorage.getItem("token");

  if (!token) {
    // If no token, redirect to sign-in (root)
    return <Navigate to="/" replace />;
  }

  // Otherwise, render the requested component
  return element;
};

export default ProtectedRoute;
