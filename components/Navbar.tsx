"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import BrandLogo from "@/components/brand/BrandLogo";
import { useTheme } from "@/components/ThemeProvider";
import { tactileButton, iosSpring } from "@/lib/motion";
import { Sun, Moon, ArrowRight, UserCheck } from "lucide-react";

export type UserRole = "student" | "admin";

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (data.authenticated && data.user) {
          setIsAuthenticated(true);
          setUserRole(data.user.role as UserRole);
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } catch {
        setIsAuthenticated(false);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full glass-nav px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors duration-300">
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
        {/* Left: Brand Logo Wordmark */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 group transition-opacity hover:opacity-90"
          aria-label="IELTSPen Ai Home"
        >
          <BrandLogo variant="auto" showSlogan={false} height={30} />
        </Link>

        {/* Right: Theme Toggle & Auth State Button */}
        <div className="flex items-center gap-3">
          {/* iOS-Style Light/Dark Theme Toggle */}
          <motion.button
            {...tactileButton}
            onClick={toggleTheme}
            aria-label="Toggle light/dark theme"
            className="p-2.5 rounded-xl glass-pill hover:bg-surfaceSecondary text-foreground transition-colors"
          >
            <motion.div
              key={theme}
              initial={{ rotate: -90, scale: 0.8, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.8, opacity: 0 }}
              transition={iosSpring}
              className="flex items-center justify-center"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </motion.div>
          </motion.button>

          {/* Auth Action Button */}
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <Link
                  href={userRole === "admin" ? "/admin" : "/dashboard"}
                  className="inline-flex"
                >
                  <motion.button
                    {...tactileButton}
                    className="px-4 py-2 rounded-xl bg-accent text-white font-medium text-xs sm:text-sm shadow-md shadow-accent/25 hover:bg-accent-hover transition-colors flex items-center gap-1.5"
                  >
                    <span>
                      {userRole === "admin" ? "Admin Studio" : "Go to Dashboard"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </Link>
              ) : (
                <Link href="/login" className="inline-flex">
                  <motion.button
                    {...tactileButton}
                    className="px-4 py-2 rounded-xl glass-pill hover:bg-surfaceSecondary font-medium text-xs sm:text-sm text-foreground transition-colors border border-border"
                  >
                    Sign In
                  </motion.button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
