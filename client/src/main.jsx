import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import { createMemoryRouter, RouterProvider, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import InvoiceGenerator from "./pages/InvoiceGenerator.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";

const getInitialRoute = () => {
  const token = sessionStorage.getItem("token");
  const lastRoute = sessionStorage.getItem("lastRoute");
  if (token) {
    if (lastRoute && (lastRoute === "/dashboard" || lastRoute === "/invoice-generator")) {
      return lastRoute;
    }
    return "/dashboard";
  }
  if (lastRoute && (lastRoute === "/signin" || lastRoute === "/signup")) {
    return lastRoute;
  }
  return "/";
};

const router = createMemoryRouter(
  [
    {
      path: "/",
      element: <App element={<Home />} />,
    },
    {
      path: "/signin",
      element: <App element={<PublicRoute element={<SignIn />} />} />,
    },
    {
      path: "/login",
      element: <App element={<PublicRoute element={<SignIn />} />} />,
    },
    {
      path: "/signup",
      element: <App element={<PublicRoute element={<SignUp />} />} />,
    },
    {
      path: "/dashboard",
      element: <App element={<ProtectedRoute element={<Dashboard />} />} />,
    },
    {
      path: "/invoice-generator",
      element: <App element={<ProtectedRoute element={<InvoiceGenerator />} />} />,
    },
    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ],
  {
    initialEntries: [getInitialRoute()],
  }
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />

    <ToastContainer
      position="bottom-right" // Set position to bottom-right
      autoClose={3000} // Automatically close after 3 seconds
      limit={1}
      hideProgressBar={false} // Show progress bar
      newestOnTop={false} // Display newest on top
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
  </StrictMode>
);
