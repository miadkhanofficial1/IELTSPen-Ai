"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import BrandLogo from "@/components/brand/BrandLogo";
import { iosSpring, tactilePress } from "@/lib/motion";
import { User, Mail, Lock, Languages, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const NATIVE_LANGUAGES = [
  { value: "English", label: "English" },
  { value: "বাংলা (Bengali)", label: "বাংলা (Bengali)" },
  { value: "हिन्दी (Hindi)", label: "हिन्दी (Hindi)" },
  { value: "العربية (Arabic)", label: "العربية (Arabic)" },
  { value: "Español (Spanish)", label: "Español (Spanish)" },
  { value: "中文 (Chinese)", label: "中文 (Chinese)" },
  { value: "Tiếng Việt (Vietnamese)", label: "Tiếng Việt (Vietnamese)" },
  { value: "اردو (Urdu)", label: "اردو (Urdu)" },
  { value: "Français (French)", label: "Français (French)" },
  { value: "Bahasa Indonesia", label: "Bahasa Indonesia" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("English");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, nativeLanguage }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create account. Please try again.");
      }

      router.push(data.redirectUrl || "/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={iosSpring}
        className="w-full max-w-[460px] glass-card rounded-3xl p-8 border border-border/80 shadow-glass-md flex flex-col items-center"
      >
        {/* Brand Logo Header */}
        <Link href="/" className="mb-6 inline-flex">
          <BrandLogo variant="auto" showSlogan={false} height={36} />
        </Link>

        <h1 className="text-xl font-bold font-heading text-foreground tracking-tight text-center">
          Create Account
        </h1>
        <p className="text-xs text-muted text-center mt-1 mb-6">
          Personalize your IELTS writing practice and localized AI evaluation.
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

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        <form onSubmit={handleRegister} className="w-full space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-xs font-semibold text-foreground mb-1.5"
            >
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm placeholder:text-muted/60 transition-colors"
              />
            </div>
          </div>

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
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-foreground mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm placeholder:text-muted/60 transition-colors"
              />
            </div>
          </div>

          {/* Native Language Selector Dropdown */}
          <div>
            <label
              htmlFor="nativeLanguage"
              className="block text-xs font-semibold text-foreground mb-1.5"
            >
              Native Language (for localized AI grammar tips)
            </label>
            <div className="relative">
              <Languages className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                id="nativeLanguage"
                value={nativeLanguage}
                onChange={(e) => setNativeLanguage(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm bg-surface text-foreground transition-colors cursor-pointer appearance-none"
              >
                {NATIVE_LANGUAGES.map((lang) => (
                  <option
                    key={lang.value}
                    value={lang.value}
                    className="bg-surface text-foreground"
                  >
                    {lang.label}
                  </option>
                ))}
              </select>
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
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        <p className="text-xs text-muted text-center mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-accent font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
