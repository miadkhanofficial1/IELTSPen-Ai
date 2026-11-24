"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import BrandLogo from "@/components/brand/BrandLogo";
import { iosSpring, tactilePress } from "@/lib/motion";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to sign in. Please verify your credentials.");
      }

      router.push(data.redirectUrl || "/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in. Please verify your credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={iosSpring}
        className="w-full max-w-[420px] glass-card rounded-3xl p-8 border border-border/80 shadow-glass-md flex flex-col items-center"
      >
        {/* Brand Logo Header */}
        <Link href="/" className="mb-6 inline-flex">
          <BrandLogo variant="auto" showSlogan={false} height={36} />
        </Link>

        <h1 className="text-xl font-bold font-heading text-foreground tracking-tight text-center">
          Sign In
        </h1>
        <p className="text-xs text-muted text-center mt-1 mb-6">
          Access your IELTS writing practice studio and AI evaluations.
        </p>

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-foreground mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm placeholder:text-muted/60 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-foreground"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm placeholder:text-muted/60 transition-colors"
              />
            </div>
          </div>

          <motion.button
            {...tactilePress}
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-[#E31837] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#E31837]/25 hover:bg-[#BE123C] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        <p className="text-xs text-muted text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-accent font-semibold hover:underline"
          >
            Register now
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
