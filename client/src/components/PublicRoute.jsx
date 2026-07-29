import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ element }) => {
  const token = sessionStorage.getItem("token");

  if (token) {
    // If user is already logged in, redirect them to the app
    return <Navigate to="/invoice-generator" replace />;
  }

  // Otherwise, render the public component (Sign In / Sign Up)
  return element;
};

export default PublicRoute;
