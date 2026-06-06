import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isAuthPage =
    location.pathname === "/signin" || location.pathname === "/signup";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-foreground/10 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-16 px-6 lg:px-8 max-w-[1400px] mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-xl font-display tracking-tight">
            CareerPrep
          </span>
          <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
            AI
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md border border-foreground/10 hover:bg-muted/50 transition-all duration-300 w-9 h-9 flex items-center justify-center shadow-sm bg-card"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`text-sm transition-colors ${
                  location.pathname?.startsWith("/dashboard")
                    ? "text-foreground font-medium"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="px-5 py-2 border border-foreground/20 rounded-md text-sm hover:bg-muted/50 transition-colors shadow-sm bg-card"
              >
                Sign Out
              </button>
            </>
          ) : isAuthPage ? (
            <div className="flex items-center relative">
              <Link
                to="/signin"
                className={`relative px-5 py-2 text-sm font-medium transition-colors z-10 ${
                  location.pathname === "/signin"
                    ? "text-primary-foreground"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {location.pathname === "/signin" && (
                  <motion.div
                    layoutId="auth-active"
                    className="absolute inset-0 bg-primary rounded-md shadow-sm -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                Sign in
              </Link>
              <Link
                to="/signup"
                className={`relative px-5 py-2 text-sm font-medium transition-colors z-10 ${
                  location.pathname === "/signup"
                    ? "text-primary-foreground"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {location.pathname === "/signup" && (
                  <motion.div
                    layoutId="auth-active"
                    className="absolute inset-0 bg-primary rounded-md shadow-sm -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                Sign up
              </Link>
            </div>
          ) : (
            <>
              <Link
                to="/signin"
                className="text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
