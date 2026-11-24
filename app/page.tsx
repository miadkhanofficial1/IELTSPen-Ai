"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import BrandLogo from "@/components/brand/BrandLogo";
import Navbar from "@/components/Navbar";
import { iosSpring, tactilePress } from "@/lib/motion";
import { ArrowRight, Github, Linkedin, Mail, Globe } from "lucide-react";
import { CreatorBio } from "@/lib/types";

// Default Creator Bio specs
const defaultBio: CreatorBio & { mission: string } = {
  name: "MD. MIAD IBNA NOOR",
  role: "Founder, MK.Studio",
  location: "Dhaka, Bangladesh",
  github: "https://github.com/miadkhanofficial1",
  linkedin: "https://www.linkedin.com/in/miadkhanofficial",
  portfolio: "https://www.behance.net/miadkhan",
  email: "miadkhan.official1@gmail.com",
  mission:
    "Built IELTSPen Ai to empower IELTS aspirants worldwide with a distraction-free, real-exam writing studio and instant multi-language AI evaluation—making Band 8+ preparation simple and accessible for everyone.",
};

export default function LandingPage() {
  const router = useRouter();
  const [creatorBio, setCreatorBio] = useState(defaultBio);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check auth status & fetch bio
    async function checkAuthAndBio() {
      try {
        const authRes = await fetch("/api/auth/me");
        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.authenticated && authData.user) {
            setIsAuthenticated(true);
            setUserRole(authData.user.role);
          } else {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }

        // Fetch creator bio from settings
        const settingsRes = await fetch("/api/settings/public");
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData.creatorBio) {
            setCreatorBio((prev) => ({
              ...prev,
              ...settingsData.creatorBio,
            }));
          }
        }
      } catch (err) {
        setIsAuthenticated(false);
      }
    }

    checkAuthAndBio();
  }, []);

  const handleCtaClick = () => {
    if (isAuthenticated) {
      if (userRole === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-accent/20 selection:text-accent">
      {/* Top Glass Navbar */}
      <Navbar />

      {/* Hero Section — Pure, Spacious & Editorial (Zero decorative badges) */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          {/* Large Hero Scale Brand Logo */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={iosSpring}
            className="mb-8 flex justify-center"
          >
            <BrandLogo
              variant="auto"
              showSlogan={true}
              height={78}
              className="max-w-[90vw] sm:max-w-none"
            />
          </motion.div>

          {/* Clean, distraction-free sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...iosSpring, delay: 0.08 }}
            className="text-base sm:text-lg md:text-xl text-muted font-normal max-w-2xl leading-relaxed tracking-tight"
          >
            An authentic, exam-grade IELTS Writing Task 1 &amp; Task 2 practice studio with real-time lockdown discipline and multi-language AI evaluation.
          </motion.p>

          {/* Prominent Primary CTA Button in Solid IELTS Crimson Red (#E31837) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...iosSpring, delay: 0.16 }}
            className="mt-10"
          >
            <motion.button
              {...tactilePress}
              onClick={handleCtaClick}
              aria-label="Let's Go"
              className="px-9 py-4 rounded-2xl bg-[#E31837] text-white font-semibold text-base sm:text-lg shadow-lg shadow-[#E31837]/30 hover:bg-[#BE123C] transition-colors flex items-center gap-3 group"
            >
              <span>Let&apos;s Go</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </motion.button>
          </motion.div>
        </div>
      </main>

      {/* Creator & Portfolio Card (Footer Section) */}
      <footer className="w-full px-4 sm:px-6 lg:px-8 pb-12 pt-6 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...iosSpring, delay: 0.22 }}
          className="w-full max-w-[640px] glass-card rounded-3xl p-6 sm:p-7 border border-border/80 shadow-glass-md flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left"
        >
          {/* Circular Avatar Placeholder / Initial Badge (MN) */}
          <div className="shrink-0 w-14 h-14 rounded-2xl bg-surfaceSecondary border border-border flex items-center justify-center font-heading font-extrabold text-lg text-foreground shadow-sm">
            MN
          </div>

          {/* Creator Information & Mission */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold font-heading text-foreground tracking-tight">
                Designed &amp; Built by {creatorBio.name}
              </h2>
              <p className="text-xs text-muted font-medium mt-0.5">
                {creatorBio.role} &bull; {creatorBio.location}
              </p>
              <p className="text-xs text-muted/90 font-normal mt-2.5 leading-relaxed">
                {creatorBio.mission}
              </p>
            </div>

            {/* Minimal Social Icon Links with Crimson Red Hover Highlights */}
            <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-center sm:justify-start gap-4 text-muted">
              <a
                href={creatorBio.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Profile"
                className="hover:text-[#E31837] transition-colors p-1"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href={creatorBio.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="hover:text-[#E31837] transition-colors p-1"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href={creatorBio.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Design Portfolio"
                className="hover:text-[#E31837] transition-colors p-1"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href={
                  creatorBio.email.startsWith("mailto:")
                    ? creatorBio.email
                    : `mailto:${creatorBio.email}`
                }
                aria-label="Contact Email"
                className="hover:text-[#E31837] transition-colors p-1"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </motion.div>
      </footer>
    </div>
  );
}
