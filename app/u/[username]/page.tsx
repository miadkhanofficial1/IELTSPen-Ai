"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import BrandLogo from "@/components/brand/BrandLogo";
import { useTheme } from "@/components/ThemeProvider";
import { iosSpring } from "@/lib/motion";
import {
  Trophy,
  Flame,
  Award,
  BookOpen,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Lock,
  Share2,
  Copy,
  Check,
  TrendingUp,
  ExternalLink,
  Shield,
  Star,
  Crown,
  FileText,
  User,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

interface PublicProfileData {
  isPrivate?: boolean;
  isOwner?: boolean;
  profile: {
    id?: string;
    full_name: string;
    username: string;
    merit_score?: number;
    bio?: string | null;
    is_profile_public?: boolean;
    created_at?: string;
  };
  stats?: {
    testsTaken: number;
    totalTimeMinutes: number;
    currentStreak: number;
    wordsSaved: number;
    averageBand: number;
    highestBand: number;
  };
  latestSubmissions?: Array<{
    id: string;
    title: string;
    task_type: string;
    band: number;
    word_count: number;
    date: string;
  }>;
  trend?: Array<{
    id: string;
    title: string;
    task_type: string;
    band: number;
    word_count: number;
    date: string;
  }>;
  activityMap?: Record<string, { count: number; seconds: number }>;
  badges?: Array<{
    id: string;
    name: string;
    category: string;
    description: string;
    threshold: number;
    current: number;
    unlocked: boolean;
    icon: string;
  }>;
}

export default function PublicStudentProfile() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();

  const rawUsername = typeof params?.username === "string" ? params.username : "";
  const [data, setData] = useState<PublicProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [heatmapMetric, setHeatmapMetric] = useState<"tests" | "time">("tests");
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    count: number;
    minutes: number;
  } | null>(null);

  useEffect(() => {
    if (!rawUsername) return;

    async function fetchPublicProfile() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/u/${encodeURIComponent(rawUsername)}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Student profile not found.");
          } else {
            setError("Unable to load profile at this time.");
          }
          return;
        }

        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error("Public profile fetch error:", err);
        setError("Failed to connect to the server.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPublicProfile();
  }, [rawUsername]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Generate 2026 calendar days for heatmap
  const heatmapDays = useMemo(() => {
    const days: Array<{
      date: string;
      count: number;
      minutes: number;
      month: number;
      dayOfWeek: number;
    }> = [];

    const startDate = new Date(2026, 0, 1);
    const endDate = new Date(2026, 11, 31);
    const cur = new Date(startDate);

    while (cur <= endDate) {
      const dateStr = cur.toISOString().split("T")[0];
      const activity = data?.activityMap?.[dateStr];
      const count = activity?.count || 0;
      const minutes = Math.round((activity?.seconds || 0) / 60);

      days.push({
        date: dateStr,
        count,
        minutes,
        month: cur.getMonth(),
        dayOfWeek: cur.getDay(), // 0 = Sun, 1 = Mon ...
      });

      cur.setDate(cur.getDate() + 1);
    }

    return days;
  }, [data?.activityMap]);

  // Group heatmap by weeks (columns)
  const heatmapWeeks = useMemo(() => {
    const weeks: Array<typeof heatmapDays> = [];
    let currentWeek: typeof heatmapDays = [];

    // Pad beginning of year to start on Sunday
    if (heatmapDays.length > 0) {
      const firstDayOfWeek = heatmapDays[0].dayOfWeek;
      for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push({
          date: "",
          count: -1,
          minutes: 0,
          month: -1,
          dayOfWeek: i,
        });
      }
    }

    for (const day of heatmapDays) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({
          date: "",
          count: -1,
          minutes: 0,
          month: -1,
          dayOfWeek: currentWeek.length,
        });
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [heatmapDays]);

  const monthLabels = [
    { name: "Jan", col: 0 },
    { name: "Feb", col: 4 },
    { name: "Mar", col: 8 },
    { name: "Apr", col: 13 },
    { name: "May", col: 17 },
    { name: "Jun", col: 21 },
    { name: "Jul", col: 26 },
    { name: "Aug", col: 30 },
    { name: "Sep", col: 35 },
    { name: "Oct", col: 39 },
    { name: "Nov", col: 43 },
    { name: "Dec", col: 48 },
  ];

  // Helper for medal icon rendering
  const renderMedalIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case "Flame":
        return <Flame className={className} />;
      case "Award":
        return <Award className={className} />;
      case "Star":
        return <Star className={className} />;
      case "Crown":
        return <Crown className={className} />;
      case "BookOpen":
        return <BookOpen className={className} />;
      default:
        return <Trophy className={className} />;
    }
  };

  const getHeatmapColor = (day: { count: number; minutes: number }) => {
    if (day.count === -1) return "invisible";
    if (heatmapMetric === "tests") {
      if (day.count === 0) return "bg-surfaceSecondary/60 dark:bg-white/5 border border-border/40";
      if (day.count === 1) return "bg-[#E31837]/30 border border-[#E31837]/40";
      if (day.count === 2) return "bg-[#E31837]/60 border border-[#E31837]/70";
      if (day.count >= 3) return "bg-[#E31837] border border-[#BE123C] shadow-sm shadow-[#E31837]/40";
    } else {
      if (day.minutes === 0) return "bg-surfaceSecondary/60 dark:bg-white/5 border border-border/40";
      if (day.minutes <= 25) return "bg-[#E31837]/30 border border-[#E31837]/40";
      if (day.minutes <= 45) return "bg-[#E31837]/60 border border-[#E31837]/70";
      return "bg-[#E31837] border border-[#BE123C] shadow-sm shadow-[#E31837]/40";
    }
    return "bg-surfaceSecondary/60";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent animate-pulse mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="font-heading font-bold text-foreground text-sm">Loading Student Profile...</p>
        <span className="text-muted text-xs mt-1">Connecting to TiDB Cloud</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-border space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold font-heading text-foreground">
            {error || "Profile Not Found"}
          </h1>
          <p className="text-xs text-muted leading-relaxed">
            The requested student handle <strong className="text-foreground">@{rawUsername}</strong> does not exist or may have been renamed.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white font-bold text-xs shadow-md shadow-accent/25 hover:bg-accent-hover transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to IELTSPen Ai</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Profile is private
  if (data.isPrivate) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-border space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-surfaceSecondary text-muted mx-auto flex items-center justify-center border border-border">
            <Lock className="w-7 h-7 text-accent" />
          </div>
          <h1 className="text-xl font-bold font-heading text-foreground">
            This Profile is Private
          </h1>
          <p className="text-xs text-muted leading-relaxed">
            <strong className="text-foreground">{data.profile.full_name}</strong> (@{data.profile.username}) has chosen to keep their IELTS study portfolio and milestone records private.
          </p>
          <div className="pt-3 flex items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-pill font-semibold text-xs text-foreground hover:bg-surfaceSecondary border border-border transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white font-bold text-xs shadow-md shadow-accent/25 hover:bg-accent-hover transition-colors"
            >
              <span>Student Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { profile, stats, latestSubmissions = [], trend = [], badges = [] } = data;

  // Compute initials
  const initials = profile.full_name
    ? profile.full_name
        .trim()
        .split(" ")
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
    : "ST";

  const memberSinceYear = profile.created_at ? new Date(profile.created_at).getFullYear() : 2026;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/20 selection:text-accent pb-16">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 glass-nav border-b border-border/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo variant="auto" showSlogan={false} height={26} className="w-auto" />
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-accent/10 text-accent font-mono">
              Student Profile
            </span>
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl glass-pill font-semibold text-xs text-foreground hover:bg-surfaceSecondary border border-border flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-muted" />
                  <span>Share</span>
                </>
              )}
            </button>

            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 rounded-xl bg-accent text-white font-bold text-xs shadow-md shadow-accent/25 hover:bg-accent-hover transition-colors"
            >
              My Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Profile Header Hero Card */}
        <section className="glass-card rounded-3xl p-6 sm:p-8 border border-white/20 dark:border-white/10 shadow-xl relative overflow-hidden bg-surface/90 backdrop-blur-xl">
          {/* Subtle accent backdrop blur circle */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 sm:gap-6 min-w-0">
              {/* Avatar */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#E31837] to-rose-500 text-white font-heading font-extrabold text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-lg shadow-[#E31837]/25">
                {initials}
              </div>

              {/* Bio & Names */}
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-foreground tracking-tight truncate">
                    {profile.full_name}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/10 text-accent font-mono border border-accent/20">
                    @{profile.username}
                  </span>
                </div>

                {profile.bio && (
                  <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed max-w-xl">
                    {profile.bio}
                  </p>
                )}

                <div className="flex items-center gap-3 text-[11px] text-muted mt-2 flex-wrap">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-accent" />
                    <span>Member since {memberSinceYear}</span>
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                    <Shield className="w-3.5 h-3.5" />
                    <span>{profile.merit_score ?? 100}% Exam Integrity</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Streak Badge */}
            <div className="p-4 rounded-2xl bg-surfaceSecondary/60 border border-border shrink-0 flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">
                  Active Streak
                </span>
                <span className="text-lg font-extrabold font-heading text-foreground block">
                  {stats?.currentStreak || 0} {stats?.currentStreak === 1 ? "Day" : "Days"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Key Real Metric Stat Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-4 border border-border">
            <span className="text-[11px] font-medium text-muted block">Tests Taken</span>
            <span className="text-2xl font-extrabold font-heading text-foreground mt-1 block">
              {stats?.testsTaken || 0}
            </span>
            <span className="text-[10px] text-muted mt-0.5 block">100% verified simulations</span>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-border">
            <span className="text-[11px] font-medium text-muted block">Study Time</span>
            <span className="text-2xl font-extrabold font-heading text-accent mt-1 block">
              {stats?.totalTimeMinutes || 0}m
            </span>
            <span className="text-[10px] text-muted mt-0.5 block">Active writing duration</span>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-border">
            <span className="text-[11px] font-medium text-muted block">Highest Band</span>
            <span className="text-2xl font-extrabold font-heading text-emerald-500 mt-1 block">
              {stats?.highestBand ? `Band ${stats.highestBand.toFixed(1)}` : "—"}
            </span>
            <span className="text-[10px] text-muted mt-0.5 block">Official Cambridge scale</span>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-border">
            <span className="text-[11px] font-medium text-muted block">Words Saved</span>
            <span className="text-2xl font-extrabold font-heading text-purple-500 mt-1 block">
              {stats?.wordsSaved || 0}
            </span>
            <span className="text-[10px] text-muted mt-0.5 block">Vocabulary &amp; Takeaways</span>
          </div>
        </section>

        {/* Band Progress Trend Line Chart */}
        <section className="glass-card rounded-3xl p-6 sm:p-7 border border-border space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold font-heading text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span>Band Progress Trend</span>
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Official Overall Band Scores across completed Cambridge writing tests
              </p>
            </div>

            {trend.length >= 2 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-accent/10 text-accent">
                Avg Band: <strong>{stats?.averageBand?.toFixed(1) || "—"}</strong>
              </span>
            )}
          </div>

          {trend.length < 2 ? (
            <div className="p-8 rounded-2xl glass-panel border border-border text-center flex flex-col items-center justify-center">
              <TrendingUp className="w-8 h-8 text-muted mb-2 opacity-60" />
              <h4 className="font-bold text-foreground text-sm">Trend appears after two tests</h4>
              <p className="text-muted text-xs mt-1 max-w-sm">
                This student has completed {trend.length} test so far. A chronological trend line will render once at least 2 tests are finished.
              </p>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {/* SVG Trend Line */}
              <div className="relative h-44 w-full">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                  {/* Grid Lines for Band 6.0, 7.0, 8.0, 9.0 */}
                  {[
                    { band: 9, y: 10 },
                    { band: 8, y: 35 },
                    { band: 7, y: 60 },
                    { band: 6, y: 85 },
                  ].map((g) => (
                    <g key={g.band}>
                      <line
                        x1="0"
                        y1={g.y}
                        x2="500"
                        y2={g.y}
                        stroke="currentColor"
                        className="text-border/40"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text
                        x="4"
                        y={g.y - 3}
                        className="text-[9px] fill-muted font-mono"
                      >
                        Band {g.band}.0
                      </text>
                    </g>
                  ))}

                  {/* Gradient Area & Line Path */}
                  {(() => {
                    const minBand = 5.0;
                    const maxBand = 9.0;
                    const pts = trend.map((t, idx) => {
                      const x = (idx / (trend.length - 1)) * 480 + 10;
                      const y = 110 - ((t.band - minBand) / (maxBand - minBand)) * 95;
                      return { x, y, data: t };
                    });

                    const pathD = pts.reduce(
                      (acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`,
                      ""
                    );

                    const areaD = `${pathD} L ${pts[pts.length - 1].x} 115 L ${pts[0].x} 115 Z`;

                    return (
                      <>
                        <defs>
                          <linearGradient id="publicTrendGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#E31837" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#E31837" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d={areaD} fill="url(#publicTrendGrad)" />
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#E31837"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {pts.map((p, idx) => (
                          <g key={idx} className="group cursor-pointer">
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="4.5"
                              fill="#E31837"
                              stroke="var(--background)"
                              strokeWidth="2"
                              className="transition-transform group-hover:scale-150"
                            />
                            {/* Hover tooltip */}
                            <title>{`${p.data.title}: Band ${p.data.band} (${new Date(p.data.date).toLocaleDateString()})`}</title>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>

              {/* X-axis chronological test nodes */}
              <div className="flex items-center justify-between text-[10px] text-muted pt-2 border-t border-border">
                <span>First Simulation ({new Date(trend[0].date).toLocaleDateString()})</span>
                <span className="font-semibold text-foreground">
                  Latest: Band {trend[trend.length - 1].band.toFixed(1)}
                </span>
                <span>Latest Simulation ({new Date(trend[trend.length - 1].date).toLocaleDateString()})</span>
              </div>
            </div>
          )}
        </section>

        {/* 2026 Activity Heatmap Grid */}
        <section className="glass-card rounded-3xl p-6 sm:p-7 border border-border space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-base font-bold font-heading text-foreground flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-accent" />
                <span>2026 Activity Heatmap</span>
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Practice volume and consistency across the year
              </p>
            </div>

            {/* Toggle metric: Tests vs Study time */}
            <div className="p-1 rounded-xl glass-panel border border-border flex items-center gap-1 text-xs font-semibold">
              <button
                onClick={() => setHeatmapMetric("tests")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  heatmapMetric === "tests"
                    ? "bg-[#E31837] text-white shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Tests
              </button>
              <button
                onClick={() => setHeatmapMetric("time")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  heatmapMetric === "time"
                    ? "bg-[#E31837] text-white shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Study time
              </button>
            </div>
          </div>

          {/* Heatmap Grid Container (Scrollable on small screens) */}
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[720px] space-y-1.5">
              {/* Month Header */}
              <div className="flex text-[10px] font-semibold text-muted pl-7">
                {monthLabels.map((m, idx) => (
                  <div key={idx} className="w-[58px] text-left truncate">
                    {m.name}
                  </div>
                ))}
              </div>

              {/* Grid with Day of week indicators */}
              <div className="flex gap-1.5 items-start">
                {/* Day labels (Mon, Wed, Fri) */}
                <div className="flex flex-col gap-1 text-[9px] font-bold text-muted uppercase tracking-tighter w-5 pt-0.5">
                  <span className="h-3 leading-3">Sun</span>
                  <span className="h-3 leading-3 opacity-0">Mon</span>
                  <span className="h-3 leading-3">Tue</span>
                  <span className="h-3 leading-3 opacity-0">Wed</span>
                  <span className="h-3 leading-3">Thu</span>
                  <span className="h-3 leading-3 opacity-0">Fri</span>
                  <span className="h-3 leading-3">Sat</span>
                </div>

                {/* Weeks columns */}
                <div className="flex gap-1">
                  {heatmapWeeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-1">
                      {week.map((day, dIdx) => {
                        const colorClass = getHeatmapColor(day);
                        return (
                          <div
                            key={dIdx}
                            onMouseEnter={() => {
                              if (day.date) {
                                setHoveredDay({
                                  date: day.date,
                                  count: day.count,
                                  minutes: day.minutes,
                                });
                              }
                            }}
                            onMouseLeave={() => setHoveredDay(null)}
                            className={`w-3 h-3 rounded-[3px] transition-all cursor-pointer ${colorClass}`}
                            title={
                              day.date
                                ? `${day.date}: ${day.count} test${day.count === 1 ? "" : "s"} (${day.minutes}m)`
                                : ""
                            }
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Heatmap Footer Legend & Hover Details */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted flex-wrap gap-2">
                <div className="text-[11px] font-medium">
                  {hoveredDay ? (
                    <span className="text-foreground">
                      <strong>{hoveredDay.date}</strong> &bull;{" "}
                      <span className="text-accent font-semibold">{hoveredDay.count} tests</span> ({hoveredDay.minutes} mins studied)
                    </span>
                  ) : (
                    <span>Hover over any day to see details</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[10px]">
                  <span>Less</span>
                  <div className="w-2.5 h-2.5 rounded-sm bg-surfaceSecondary/60 border border-border/40" />
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#E31837]/30" />
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#E31837]/60" />
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#E31837]" />
                  <span>More</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real Streaks & Achievements Medals System (3x3 Grid) */}
        <section className="glass-card rounded-3xl p-6 sm:p-7 border border-border space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold font-heading text-foreground flex items-center gap-2">
                <Award className="w-4 h-4 text-accent" />
                <span>Verified Milestones &amp; Badges</span>
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Unlocked automatically by genuine TiDB database records
              </p>
            </div>

            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-accent/10 text-accent">
              {badges.filter((b) => b.unlocked).length} / {badges.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((b) => {
              const progressPct = Math.min(100, Math.round((b.current / b.threshold) * 100));
              return (
                <div
                  key={b.id}
                  className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                    b.unlocked
                      ? "glass-card border-accent/40 bg-accent/5 shadow-sm"
                      : "bg-surfaceSecondary/30 border-border/60 opacity-70"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          b.unlocked
                            ? "bg-accent/15 text-accent shadow-sm"
                            : "bg-surfaceSecondary text-muted"
                        }`}
                      >
                        {renderMedalIcon(b.icon, "w-5 h-5")}
                      </div>

                      {b.unlocked ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Unlocked</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surfaceSecondary text-muted flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Locked</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold font-heading text-sm text-foreground">
                      {b.name}
                    </h3>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      {b.description}
                    </p>
                  </div>

                  {/* Progress Bar for Locked / Target Indicator for Unlocked */}
                  <div className="mt-4 pt-3 border-t border-border/60">
                    <div className="flex items-center justify-between text-[10px] font-semibold mb-1">
                      <span className="text-muted">Progress</span>
                      <span className={b.unlocked ? "text-emerald-500" : "text-muted"}>
                        {b.current} / {b.threshold}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surfaceSecondary overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          b.unlocked ? "bg-emerald-500" : "bg-accent/70"
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Latest Completed Simulations */}
        <section className="glass-card rounded-3xl p-6 sm:p-7 border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Latest Verified Simulations</span>
            </h2>
            <span className="text-xs text-muted">
              {latestSubmissions.length} recent tests shown
            </span>
          </div>

          {latestSubmissions.length === 0 ? (
            <div className="p-8 rounded-2xl glass-panel border border-border text-center flex flex-col items-center">
              <FileText className="w-8 h-8 text-muted mb-2 opacity-60" />
              <p className="font-semibold text-foreground text-xs">No exams submitted yet</p>
              <p className="text-muted text-[11px] mt-1">
                Completed tests under strict lockdown will display here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {latestSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-2xl glass-panel border border-border flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-accent/10 text-accent">
                        Band {sub.band ? sub.band.toFixed(1) : "—"}
                      </span>
                      <span className="text-muted font-medium uppercase text-[10px]">
                        {sub.task_type === "task_1" ? "Task 1 (Visual Data)" : "Task 2 (Essay)"}
                      </span>
                    </div>
                    <h4 className="font-bold text-foreground truncate">{sub.title}</h4>
                    <span className="text-[10px] text-muted">
                      {sub.word_count} words &bull; {new Date(sub.date).toLocaleDateString()}
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-bold shrink-0 border border-emerald-500/20">
                    Cambridge Verified
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer Brand Banner */}
        <footer className="pt-6 border-t border-border/60 text-center space-y-2">
          <p className="text-xs text-muted">
            Powered by <strong className="text-foreground">IELTSPen Ai</strong> &bull; Authentic Cambridge IELTS Simulation &amp; Multi-Criterion Evaluation
          </p>
          <p className="text-[11px] text-muted font-mono">
            100% Genuine Cloud Records &bull; Anti-Cheat Verified
          </p>
        </footer>
      </main>
    </div>
  );
}
