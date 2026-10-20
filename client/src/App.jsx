import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const App = ({ element }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Lock the browser address bar to the single root URL "/"
  useEffect(() => {
    if (window.location.pathname !== "/" || window.location.hash !== "") {
      window.history.replaceState(null, "", "/");
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (location.pathname) {
      sessionStorage.setItem("lastRoute", location.pathname);
    }
  }, [location.pathname]);

  useEffect(() => {
    let timeoutId;
    const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

    const checkIdleStatus = () => {
      const lastActivity = sessionStorage.getItem("lastActivity");
      const token = sessionStorage.getItem("token");
      
      if (token && lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
        if (timeSinceLastActivity >= IDLE_TIMEOUT) {
          // User has been idle for 30+ minutes (even if tab was closed)
          if (location.pathname !== "/" && location.pathname !== "/signup" && location.pathname !== "/signin" && location.pathname !== "/login") {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            sessionStorage.removeItem("lastActivity");
            toast.info("Session expired due to inactivity.");
            navigate("/");
          }
        }
      }
    };

    const updateActivity = () => {
      sessionStorage.setItem("lastActivity", Date.now().toString());
      // Reset the JS interval check
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkIdleStatus, IDLE_TIMEOUT);
    };

    // Check immediately on mount/route change
    checkIdleStatus();
    // Also record activity right away so we don't instantly log out on fresh login
    if (sessionStorage.getItem("token")) {
        const lastActivity = sessionStorage.getItem("lastActivity");
        if (!lastActivity) {
            sessionStorage.setItem("lastActivity", Date.now().toString());
        }
    }

    // Set initial timeout
    timeoutId = setTimeout(checkIdleStatus, IDLE_TIMEOUT);

    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keydown", updateActivity);
    window.addEventListener("click", updateActivity);
    window.addEventListener("scroll", updateActivity);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("click", updateActivity);
      window.removeEventListener("scroll", updateActivity);
    };
  }, [navigate, location.pathname]);

  return (
    <>
      <main>{element}</main>
    </>
  );
};

export default App;
