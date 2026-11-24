"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import BrandLogo from "@/components/brand/BrandLogo";
import { useTheme } from "@/components/ThemeProvider";
import {
  iosSpring,
  tactilePress,
  tactileButton,
  bottomSheetVariants,
  backdropVariants,
  fadeInScaleVariants,
} from "@/lib/motion";
import {
  Sun,
  Moon,
  Shield,
  ShieldAlert,
  LogOut,
  ArrowRight,
  Languages,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
  BookOpen,
  Lock,
  ChevronDown,
  Layers,
  Send,
  Loader2,
  Info,
  FolderDown,
  Download,
  Eye,
  Lightbulb,
  File,
  X,
} from "lucide-react";
import EvaluationReviewModal from "@/components/results/EvaluationReviewModal";
import { WritingTask, Submission, FreeAssetFile, StudyAsset } from "@/lib/types";

const NATIVE_LANGUAGES = [
  "English",
  "বাংলা (Bengali)",
  "हिन्दी (Hindi)",
  "العربية (Arabic)",
  "Español (Spanish)",
  "中文 (Chinese)",
  "Tiếng Việt (Vietnamese)",
  "اردو (Urdu)",
  "Français (French)",
  "Bahasa Indonesia",
];

export default function StudentDashboard() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // User and profile state
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("Scholar");
  const [nativeLanguage, setNativeLanguage] = useState("English");
  const [meritScore, setMeritScore] = useState(100);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [globalAnnouncement, setGlobalAnnouncement] = useState<string | null>(null);

  // Tabs and filters
  const [activeTab, setActiveTab] = useState<"practice" | "history" | "assets">("practice");
  const [taskFilter, setTaskFilter] = useState<"all" | "task_1" | "task_2" | "completed">("all");

  // Data collections
  const [tasks, setTasks] = useState<WritingTask[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Appeal modal state
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
  const [appealMessage, setAppealMessage] = useState("");
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);
  const [appealSuccess, setAppealSuccess] = useState(false);

  // Review modal state
  const [reviewModalData, setReviewModalData] = useState<{
    isOpen: boolean;
    submission: Submission | null;
    task: WritingTask | null;
  }>({
    isOpen: false,
    submission: null,
    task: null,
  });

  // Countdown timer for 15-minute lockdown
  const [remainingLockSeconds, setRemainingLockSeconds] = useState<number>(0);

  // Free Assets & Study Takeaways state
  const [assetSubTab, setAssetSubTab] = useState<"files" | "vocabulary" | "grammar" | "tricks">("files");
  const [freeAssetFiles, setFreeAssetFiles] = useState<FreeAssetFile[]>([]);
  const [studyVocabulary, setStudyVocabulary] = useState<StudyAsset[]>([]);
  const [studyGrammar, setStudyGrammar] = useState<StudyAsset[]>([]);
  const [studyTricks, setStudyTricks] = useState<StudyAsset[]>([]);
  const [isLoadingStudyAssets, setIsLoadingStudyAssets] = useState<boolean>(false);
  const [viewerFile, setViewerFile] = useState<FreeAssetFile | null>(null);
  const [assetCategoryFilter, setAssetCategoryFilter] = useState<string>("all");

  const loadStudyAssets = async (lang: string) => {
    setIsLoadingStudyAssets(true);
    try {
      const res = await fetch(`/api/student/study-assets?lang=${encodeURIComponent(lang)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.files) setFreeAssetFiles(data.files);
        if (data.vocabulary) setStudyVocabulary(data.vocabulary);
        if (data.grammar) setStudyGrammar(data.grammar);
        if (data.tricks) setStudyTricks(data.tricks);
      }
    } catch (err) {
      console.warn("Failed to load study assets:", err);
    } finally {
      setIsLoadingStudyAssets(false);
    }
  };

  // Initialize and load data
  useEffect(() => {
    async function loadDashboardData() {
      try {
        const res = await fetch("/api/student/dashboard-data");
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
          }
          return;
        }

        const data = await res.json();
        if (data.profile) {
          setUserId(data.profile.id);
          if (data.profile.full_name) setUserName(data.profile.full_name);
          if (data.profile.native_language) setNativeLanguage(data.profile.native_language);
          if (typeof data.profile.merit_score === "number") setMeritScore(data.profile.merit_score);
          if (data.profile.locked_until) setLockedUntil(data.profile.locked_until);
        }

        if (data.globalAnnouncement) {
          setGlobalAnnouncement(data.globalAnnouncement);
        }

        if (data.tasks && data.tasks.length > 0) {
          setTasks(data.tasks);
        }

        if (data.submissions) {
          setSubmissions(data.submissions);
        }

        // Load study assets and files
        loadStudyAssets(data.profile?.native_language || "English");
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();

    // Lightweight status polling replacing Supabase Realtime
    const pollInterval = setInterval(async () => {
      try {
        const statusRes = await fetch("/api/student/status");
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (typeof statusData.meritScore === "number") {
            setMeritScore(statusData.meritScore);
          }
          setLockedUntil(statusData.lockedUntil || null);
          if (statusData.globalAnnouncement !== undefined) {
            setGlobalAnnouncement(statusData.globalAnnouncement);
          }
        }
      } catch (e) {
        // Ignore polling errors
      }
    }, lockedUntil ? 4000 : 12000);

    return () => clearInterval(pollInterval);
  }, [router, lockedUntil]);

  // Handle countdown calculation for locked_until
  useEffect(() => {
    if (!lockedUntil) {
      setRemainingLockSeconds(0);
      return;
    }

    const checkLock = () => {
      const lockTime = new Date(lockedUntil).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((lockTime - now) / 1000));
      setRemainingLockSeconds(diff);
    };

    checkLock();
    const interval = setInterval(checkLock, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const isLocked = remainingLockSeconds > 0;

  // Format seconds to MM:SS
  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Update native language
  const handleLanguageChange = async (newLang: string) => {
    setNativeLanguage(newLang);
    loadStudyAssets(newLang);
    if (!userId) return;
    try {
      await fetch("/api/student/dashboard-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nativeLanguage: newLang }),
      });
    } catch (err) {
      console.warn("Could not save language preference:", err);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Sign out error:", err);
    }
    router.push("/");
  };

  // Handle unlock appeal submission
  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !appealMessage.trim()) return;

    setIsSubmittingAppeal(true);
    try {
      const res = await fetch("/api/admin/appeals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: appealMessage.trim() }),
      });

      if (res.ok) {
        setAppealSuccess(true);
        setTimeout(() => {
          setIsAppealModalOpen(false);
          setAppealSuccess(false);
          setAppealMessage("");
        }, 2000);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit appeal.");
      }
    } catch (err) {
      console.error("Appeal error:", err);
    } finally {
      setIsSubmittingAppeal(false);
    }
  };

  // Map of completed submissions keyed by task_id
  const completedTaskMap = useMemo(() => {
    const map = new Map<string, Submission>();
    submissions.forEach((s) => {
      if (s.status === "completed" && !map.has(s.task_id)) {
        map.set(s.task_id, s);
      }
    });
    return map;
  }, [submissions]);

  // Map of failed cheat submissions keyed by task_id
  const failedCheatTaskMap = useMemo(() => {
    const map = new Map<string, Submission>();
    submissions.forEach((s) => {
      if (s.status === "failed_cheat" && !map.has(s.task_id)) {
        map.set(s.task_id, s);
      }
    });
    return map;
  }, [submissions]);

  // Filtered practice feed tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const isCompleted = completedTaskMap.has(t.id);
      if (taskFilter === "all") return true;
      if (taskFilter === "task_1") return t.task_type === "task_1";
      if (taskFilter === "task_2") return t.task_type === "task_2";
      if (taskFilter === "completed") return isCompleted;
      return true;
    });
  }, [tasks, taskFilter, completedTaskMap]);

  // Aggregate vocabulary assets across all published tasks for Free Assets
  const aggregatedVocabulary = useMemo(() => {
    const map = new Map<string, { category: string; assets: any[] }>();
    tasks.forEach((t) => {
      if (t.vocabulary_assets && Array.isArray(t.vocabulary_assets)) {
        const cat = t.topic_category || "General Academic";
        if (!map.has(cat)) {
          map.set(cat, { category: cat, assets: [] });
        }
        map.get(cat)!.assets.push(...t.vocabulary_assets);
      }
    });
    return Array.from(map.values());
  }, [tasks]);

  // Format bytes to human readable string
  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Categories for free asset files
  const fileCategories = useMemo(() => {
    const cats = new Set<string>();
    freeAssetFiles.forEach((f) => {
      if (f.category) cats.add(f.category);
    });
    return ["all", ...Array.from(cats)];
  }, [freeAssetFiles]);

  // Filtered free asset files
  const filteredFiles = useMemo(() => {
    if (assetCategoryFilter === "all") return freeAssetFiles;
    return freeAssetFiles.filter((f) => f.category === assetCategoryFilter);
  }, [freeAssetFiles, assetCategoryFilter]);

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-accent/20 selection:text-accent">
      {/* 1. TOP GLASS HEADER */}
      <header className="sticky top-0 z-40 w-full glass-nav px-4 sm:px-8 py-3.5 transition-colors duration-300">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <BrandLogo variant="auto" showSlogan={false} height={28} />
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Live Merit Score Badge */}
            <div
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold border transition-colors ${
                meritScore >= 80
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : meritScore >= 50
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  : "bg-red-500/10 text-red-500 border-red-500/20"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Merit: {meritScore}%</span>
            </div>

            {/* Native Language Quick-Selector */}
            <div className="relative hidden md:flex items-center">
              <Languages className="w-3.5 h-3.5 text-muted absolute left-3 pointer-events-none" />
              <select
                value={nativeLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                aria-label="Native Language"
                className="pl-8 pr-7 py-1.5 rounded-xl glass-pill text-xs font-semibold text-foreground bg-surface border border-border cursor-pointer appearance-none"
              >
                {NATIVE_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang} className="bg-surface text-foreground">
                    {lang}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-muted absolute right-2.5 pointer-events-none" />
            </div>

            {/* Theme Toggle */}
            <motion.button
              {...tactileButton}
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl glass-pill hover:bg-surfaceSecondary text-foreground transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </motion.button>

            {/* Sign Out */}
            <motion.button
              {...tactileButton}
              onClick={handleSignOut}
              aria-label="Sign Out"
              className="p-2 rounded-xl glass-pill hover:bg-surfaceSecondary text-muted hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Global Announcement Banner (if configured) */}
      {globalAnnouncement && (
        <div className="w-full bg-accent/10 border-b border-accent/20 px-4 py-2 text-center text-xs text-accent flex items-center justify-center gap-2">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>{globalAnnouncement}</span>
        </div>
      )}

      {/* 2. MAIN DASHBOARD CONTENT */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
              Welcome, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-0.5">
              Distraction-free IELTS exam studio &bull; Evaluated in {nativeLanguage}
            </p>
          </div>

          {/* Segmented Pill Navigation Tabs */}
          <div className="p-1 rounded-2xl glass-pill flex items-center gap-1 border border-border/80 self-start sm:self-auto">
            {(
              [
                { id: "practice", label: "Practice Feed", icon: FileText },
                { id: "history", label: "Test History", icon: CheckCircle2 },
                { id: "assets", label: "Free Assets", icon: BookOpen },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isSelected ? "text-foreground" : "text-muted hover:text-foreground"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="dashboardTabPill"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                      className="absolute inset-0 bg-surface rounded-xl shadow-sm border border-border"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: PRACTICE FEED */}
        {activeTab === "practice" && (
          <div className="space-y-6">
            {/* Sub-Filters: All | Task 1 | Task 2 | Completed */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {[
                { id: "all", label: "All Tasks" },
                { id: "task_1", label: "Task 1 (Academic Charts)" },
                { id: "task_2", label: "Task 2 (Essays)" },
                { id: "completed", label: "Completed" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTaskFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
                    taskFilter === f.id
                      ? "bg-[#E31837] text-white shadow-sm"
                      : "glass-pill text-muted hover:text-foreground border border-border"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Task Cards Grid */}
            {filteredTasks.length === 0 ? (
              <div className="glass-card rounded-3xl p-12 text-center flex flex-col items-center">
                <FileText className="w-10 h-10 text-muted mb-3 opacity-60" />
                <h3 className="text-base font-bold font-heading text-foreground mb-1">
                  No Practice Tasks Available
                </h3>
                <p className="text-xs text-muted max-w-sm leading-relaxed">
                  No published writing tasks match this category yet. Please check back soon or switch categories.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredTasks.map((task) => {
                const isCompleted = completedTaskMap.has(task.id);
                const failedCheat = failedCheatTaskMap.has(task.id);
                const pastSubmission = completedTaskMap.get(task.id);

                return (
                  <div
                    key={task.id}
                    className="glass-card rounded-3xl p-6 border border-border/80 flex flex-col justify-between transition-all hover:border-accent/40"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              task.task_type === "task_1"
                                ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                : "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                            }`}
                          >
                            {task.task_type === "task_1" ? "Task 1: Academic Data" : "Task 2: Essay"}
                          </span>

                          <span className="text-[11px] text-muted font-medium">
                            {task.topic_category}
                          </span>
                        </div>

                        {/* Status Tags */}
                        {isCompleted && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Band {pastSubmission?.overall_band?.toFixed(1) || "Done"}
                          </span>
                        )}

                        {!isCompleted && failedCheat && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/25 flex items-center gap-1">
                            <RotateCcw className="w-3 h-3" />
                            Retry Available
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold font-heading text-foreground mb-2 line-clamp-2">
                        {task.title}
                      </h3>

                      <p className="text-xs text-muted leading-relaxed line-clamp-3 mb-4">
                        {task.prompt_text}
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-muted text-[11px]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-accent" />
                          {task.task_type === "task_1" ? "20 Mins" : "40 Mins"}
                        </span>
                        <span>&bull;</span>
                        <span>{task.task_type === "task_1" ? "≥ 150 Words" : "≥ 250 Words"}</span>
                      </div>

                      {isCompleted ? (
                        <button
                          onClick={() => {
                            if (pastSubmission) {
                              setReviewModalData({
                                isOpen: true,
                                submission: pastSubmission,
                                task,
                              });
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-xl glass-pill font-semibold text-xs text-accent hover:bg-surfaceSecondary border border-border transition-colors"
                        >
                          Review Result
                        </button>
                      ) : (
                        <Link href={`/practice/${task.id}`}>
                          <motion.button
                            {...tactileButton}
                            disabled={isLocked}
                            className={`px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors ${
                              isLocked
                                ? "bg-muted/40 text-muted cursor-not-allowed"
                                : "bg-[#E31837] text-white shadow-md shadow-[#E31837]/25 hover:bg-[#BE123C]"
                            }`}
                          >
                            <span>{failedCheat ? "Retry Exam" : "Start Exam"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </motion.button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TEST HISTORY (ONLY successfully completed tests) */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {submissions.filter((s) => s.status === "completed").length === 0 ? (
              <div className="glass-card rounded-3xl p-12 text-center flex flex-col items-center">
                <CheckCircle2 className="w-10 h-10 text-muted mb-3 opacity-60" />
                <h3 className="text-base font-bold font-heading text-foreground mb-1">
                  No Completed Tests Yet
                </h3>
                <p className="text-xs text-muted max-w-sm mb-5 leading-relaxed">
                  Complete an exam simulation in the Practice Feed to view detailed band reports, sentence improvements, and Band 9 model answers.
                </p>
                <button
                  onClick={() => setActiveTab("practice")}
                  className="px-4 py-2 rounded-xl bg-accent text-white font-semibold text-xs shadow-md"
                >
                  Browse Practice Tasks
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions
                  .filter((s) => s.status === "completed")
                  .map((submission) => {
                    const task = tasks.find((t) => t.id === submission.task_id);
                    return (
                      <div
                        key={submission.id}
                        onClick={() => {
                          setReviewModalData({
                            isOpen: true,
                            submission,
                            task: task || null,
                          });
                        }}
                        className="glass-card rounded-2xl p-4 sm:p-5 border border-border flex items-center justify-between gap-4 cursor-pointer hover:border-accent/40 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {/* Band Score Pill */}
                          <div className="w-12 h-12 rounded-2xl bg-accent text-white flex flex-col items-center justify-center font-heading font-extrabold shadow-sm shrink-0">
                            <span className="text-base leading-none">
                              {submission.overall_band?.toFixed(1) || "7.0"}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider opacity-80">Band</span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase text-accent">
                                {task?.task_type === "task_1" ? "Task 1 Academic" : "Task 2 Essay"}
                              </span>
                              <span className="text-xs text-muted">&bull;</span>
                              <span className="text-xs text-muted">
                                {new Date(submission.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold font-heading text-foreground mt-0.5 line-clamp-1">
                              {task?.title || "IELTS Writing Simulation"}
                            </h4>
                            <p className="text-xs text-muted mt-0.5">
                              {submission.word_count} Words &bull; 0 Tab Violations
                            </p>
                          </div>
                        </div>

                        <button className="px-3 py-1.5 rounded-xl glass-pill font-semibold text-xs text-accent hover:bg-surfaceSecondary border border-border shrink-0">
                          View Analysis &rarr;
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FREE ASSETS & BILINGUAL STUDY TAKEAWAYS */}
        {activeTab === "assets" && (
          <div className="space-y-8">
            {/* Header with Language Indicator */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
                    Band 9 Knowledge Base
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-surfaceSecondary text-muted border border-border flex items-center gap-1">
                    <Languages className="w-3 h-3 text-accent" />
                    <span>{nativeLanguage}</span>
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-foreground">
                  Free Assets & Study Takeaways
                </h1>
                <p className="text-xs sm:text-sm text-muted mt-1 max-w-2xl leading-relaxed">
                  Curated Band 9 cheat sheets, PDF guides, and auto-harvested takeaways from your evaluations translated into {nativeLanguage}.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                <button
                  onClick={() => loadStudyAssets(nativeLanguage)}
                  disabled={isLoadingStudyAssets}
                  className="px-3.5 py-2 rounded-xl bg-surfaceSecondary hover:bg-border text-foreground text-xs font-semibold border border-border transition-all flex items-center gap-1.5 disabled:opacity-50"
                  title="Refresh study takeaways"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isLoadingStudyAssets ? "animate-spin text-accent" : ""}`} />
                  <span>Sync Assets</span>
                </button>
              </div>
            </div>

            {/* 4 iOS Segmented Sub-Tabs */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl glass-card border border-border max-w-2xl overflow-x-auto scrollbar-none">
              <button
                onClick={() => setAssetSubTab("files")}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  assetSubTab === "files"
                    ? "bg-accent text-white shadow-md shadow-accent/25"
                    : "text-muted hover:text-foreground hover:bg-surfaceSecondary/50"
                }`}
              >
                <FolderDown className="w-3.5 h-3.5" />
                <span>Files & PDFs</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  assetSubTab === "files" ? "bg-white/20 text-white" : "bg-surfaceSecondary text-muted"
                }`}>
                  {freeAssetFiles.length}
                </span>
              </button>

              <button
                onClick={() => setAssetSubTab("vocabulary")}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  assetSubTab === "vocabulary"
                    ? "bg-accent text-white shadow-md shadow-accent/25"
                    : "text-muted hover:text-foreground hover:bg-surfaceSecondary/50"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Vocabulary</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  assetSubTab === "vocabulary" ? "bg-white/20 text-white" : "bg-surfaceSecondary text-muted"
                }`}>
                  {studyVocabulary.length}
                </span>
              </button>

              <button
                onClick={() => setAssetSubTab("grammar")}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  assetSubTab === "grammar"
                    ? "bg-accent text-white shadow-md shadow-accent/25"
                    : "text-muted hover:text-foreground hover:bg-surfaceSecondary/50"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Grammar</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  assetSubTab === "grammar" ? "bg-white/20 text-white" : "bg-surfaceSecondary text-muted"
                }`}>
                  {studyGrammar.length}
                </span>
              </button>

              <button
                onClick={() => setAssetSubTab("tricks")}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  assetSubTab === "tricks"
                    ? "bg-accent text-white shadow-md shadow-accent/25"
                    : "text-muted hover:text-foreground hover:bg-surfaceSecondary/50"
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Exam Tricks</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  assetSubTab === "tricks" ? "bg-white/20 text-white" : "bg-surfaceSecondary text-muted"
                }`}>
                  {studyTricks.length}
                </span>
              </button>
            </div>

            {/* SUB-TAB 1: FILES & PDFS */}
            {assetSubTab === "files" && (
              <div className="space-y-6">
                {/* Category Filter Pills */}
                {fileCategories.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {fileCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setAssetCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all capitalize ${
                          assetCategoryFilter === cat
                            ? "bg-foreground text-background shadow-sm"
                            : "bg-surfaceSecondary/80 text-muted hover:text-foreground border border-border"
                        }`}
                      >
                        {cat === "all" ? "All Files" : cat.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                )}

                {/* File Grid */}
                {filteredFiles.length === 0 ? (
                  <div className="glass-card rounded-3xl p-10 text-center border border-border flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-surfaceSecondary flex items-center justify-center text-muted mb-3">
                      <FolderDown className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold font-heading text-sm text-foreground">
                      No study files published yet
                    </h3>
                    <p className="text-xs text-muted max-w-sm mt-1">
                      Check back soon — our educators and examiners publish Cambridge cheat sheets, model essays, and chart guides regularly.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        className="glass-card rounded-2xl p-5 border border-border hover:border-accent/40 transition-all flex flex-col justify-between group shadow-sm"
                      >
                        <div>
                          {/* File Type & Category */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                                file.file_type === "pdf"
                                  ? "bg-[#E31837]/10 text-[#E31837] border border-[#E31837]/20"
                                  : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                              }`}
                            >
                              {file.file_type === "pdf" ? (
                                <FileText className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                              <span>{file.file_type}</span>
                            </span>

                            {file.category && (
                              <span className="text-[11px] text-muted capitalize truncate">
                                {file.category.replace(/_/g, " ")}
                              </span>
                            )}
                          </div>

                          {/* Title & Description */}
                          <h3 className="font-bold font-heading text-sm text-foreground group-hover:text-accent transition-colors line-clamp-1">
                            {file.title}
                          </h3>
                          <p className="text-xs text-muted mt-1.5 line-clamp-2 min-h-[32px] leading-relaxed">
                            {file.description || "Official IELTS preparation resource published by IELTSPen Ai."}
                          </p>
                        </div>

                        {/* Metadata & Actions */}
                        <div className="mt-4 pt-3 border-t border-border/60">
                          <div className="flex items-center justify-between text-[11px] text-muted mb-3 font-mono">
                            <span className="truncate max-w-[140px]">{file.file_name}</span>
                            <span>{formatFileSize(file.file_size)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setViewerFile(file)}
                              className="flex-1 py-2 rounded-xl bg-accent/10 hover:bg-accent/20 text-accent font-semibold text-xs border border-accent/20 transition-all flex items-center justify-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>

                            <a
                              href={`${file.file_url}?download=1`}
                              download={file.file_name}
                              className="px-3.5 py-2 rounded-xl bg-surfaceSecondary hover:bg-border text-foreground text-xs font-semibold border border-border transition-all flex items-center justify-center gap-1.5"
                              title="Download to device"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Save</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 2: VOCABULARY */}
            {assetSubTab === "vocabulary" && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-surfaceSecondary/50 border border-border text-xs text-muted flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-accent/10 text-accent shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-foreground">Band 8+ Academic Lexicon:</strong> Auto-harvested from your writing submissions and Cambridge Band 9 benchmarks. Word meanings and contextual nuances are translated into <span className="text-accent font-semibold">{nativeLanguage}</span>.
                  </div>
                </div>

                {studyVocabulary.length === 0 ? (
                  <div className="glass-card rounded-3xl p-10 text-center border border-border flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-surfaceSecondary flex items-center justify-center text-muted mb-3">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold font-heading text-sm text-foreground">
                      No vocabulary takeaways unlocked yet
                    </h3>
                    <p className="text-xs text-muted max-w-sm mt-1">
                      Complete any writing practice task to automatically harvest high-level collocations and lexical improvements.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studyVocabulary.map((item) => (
                      <div
                        key={item.id}
                        className="glass-card rounded-2xl p-5 border border-border hover:border-accent/30 transition-all flex flex-col justify-between gap-3 shadow-sm"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold font-heading text-base text-foreground tracking-tight">
                              {item.title_en}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-accent/10 text-accent border border-accent/20 uppercase">
                              Band 8.5+
                            </span>
                          </div>

                          {(item.content_en || item.example_en) && (
                            <div className="p-2.5 rounded-xl bg-surfaceSecondary/60 border border-border/60 text-xs text-foreground/90 italic">
                              &ldquo;{item.content_en || item.example_en}&rdquo;
                            </div>
                          )}
                        </div>

                        {/* Bilingual Explanation Box */}
                        <div className="p-3.5 rounded-xl bg-accent/5 border border-accent/20 space-y-1">
                          <div className="text-[11px] font-bold text-accent flex items-center gap-1.5">
                            <Lightbulb className="w-3 h-3" />
                            <span>{nativeLanguage} Explanation</span>
                          </div>
                          <p className="text-xs text-foreground/90 leading-relaxed font-sans">
                            {item.display_explanation || item.explanation_native || item.content_en}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Additional Category Vocabulary from Tasks */}
                {aggregatedVocabulary.length > 0 && (
                  <div className="pt-6 border-t border-border">
                    <h3 className="text-sm font-bold font-heading text-foreground mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <span>Topic Word Banks from Published Exams</span>
                    </h3>

                    <div className="space-y-4">
                      {aggregatedVocabulary.map((catGroup) => (
                        <div key={catGroup.category} className="glass-card rounded-2xl p-5 border border-border">
                          <h4 className="text-xs font-bold font-heading text-foreground mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent" />
                            <span>{catGroup.category}</span>
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {catGroup.assets.map((voc: any, i: number) => (
                              <div
                                key={i}
                                className="p-3 rounded-xl bg-surfaceSecondary/60 border border-border flex flex-col gap-1"
                              >
                                <span className="font-bold text-accent font-heading">
                                  {voc.word}
                                </span>
                                <p className="text-foreground/90 text-[11px]">
                                  {voc.meaning}
                                </p>
                                <p className="text-muted italic text-[10px] mt-0.5">
                                  &ldquo;{voc.example}&rdquo;
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 3: GRAMMAR */}
            {assetSubTab === "grammar" && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-surfaceSecondary/50 border border-border text-xs text-muted flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-foreground">Complex Grammar & Sentence Structures:</strong> Master passive inversions, concessive clauses, and cohesive transitions to satisfy Grammatical Range and Accuracy (GRA) Band 8+. Clear breakdown in <span className="text-blue-500 font-semibold">{nativeLanguage}</span>.
                  </div>
                </div>

                {studyGrammar.length === 0 ? (
                  <div className="glass-card rounded-3xl p-10 text-center border border-border flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-surfaceSecondary flex items-center justify-center text-muted mb-3">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold font-heading text-sm text-foreground">
                      No grammar structures unlocked yet
                    </h3>
                    <p className="text-xs text-muted max-w-sm mt-1">
                      Complete essays to extract sophisticated sentence frameworks and syntax improvements tailored to your writing.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studyGrammar.map((item) => (
                      <div
                        key={item.id}
                        className="glass-card rounded-2xl p-5 border border-border hover:border-blue-500/30 transition-all flex flex-col justify-between gap-3 shadow-sm"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold font-heading text-sm text-foreground">
                              {item.title_en}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase">
                              GRA Band 8+
                            </span>
                          </div>

                          {(item.content_en || item.example_en) && (
                            <div className="p-2.5 rounded-xl bg-surfaceSecondary/60 border border-border/60 text-xs text-foreground/90 font-mono">
                              &ldquo;{item.content_en || item.example_en}&rdquo;
                            </div>
                          )}
                        </div>

                        {/* Bilingual Explanation Box */}
                        <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-1">
                          <div className="text-[11px] font-bold text-blue-500 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" />
                            <span>{nativeLanguage} Breakdown & Why it Works</span>
                          </div>
                          <p className="text-xs text-foreground/90 leading-relaxed font-sans">
                            {item.display_explanation || item.explanation_native || item.content_en}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 4: EXAM TRICKS */}
            {assetSubTab === "tricks" && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-surfaceSecondary/50 border border-border text-xs text-muted flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 shrink-0 mt-0.5">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-foreground">Cambridge Examiner Secrets & Tactics:</strong> Time management heuristics, Task 1 overview rules, and Task 2 thesis frameworks to prevent score deductions. Explained in <span className="text-amber-500 font-semibold">{nativeLanguage}</span>.
                  </div>
                </div>

                {studyTricks.length === 0 ? (
                  <div className="glass-card rounded-3xl p-10 text-center border border-border flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-surfaceSecondary flex items-center justify-center text-muted mb-3">
                      <Lightbulb className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold font-heading text-sm text-foreground">
                      No exam tricks harvested yet
                    </h3>
                    <p className="text-xs text-muted max-w-sm mt-1">
                      Our AI will automatically surface Cambridge exam strategies from your essay evaluations.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studyTricks.map((item) => (
                      <div
                        key={item.id}
                        className="glass-card rounded-2xl p-5 border border-border hover:border-amber-500/30 transition-all flex flex-col justify-between gap-3 shadow-sm"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold font-heading text-sm text-foreground">
                              {item.title_en}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase">
                              Examiner Trick
                            </span>
                          </div>

                          {(item.content_en || item.example_en) && (
                            <div className="p-2.5 rounded-xl bg-surfaceSecondary/60 border border-border/60 text-xs text-foreground/90 leading-relaxed">
                              &ldquo;{item.content_en || item.example_en}&rdquo;
                            </div>
                          )}
                        </div>

                        {/* Bilingual Explanation Box */}
                        <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                          <div className="text-[11px] font-bold text-amber-500 flex items-center gap-1.5">
                            <Lightbulb className="w-3 h-3" />
                            <span>{nativeLanguage} Examiner Secret</span>
                          </div>
                          <p className="text-xs text-foreground/90 leading-relaxed font-sans">
                            {item.display_explanation || item.explanation_native || item.content_en}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Band 9 Blueprint Writing Structures (Permanent Reference) */}
            <div className="pt-6 border-t border-border">
              <h2 className="text-base font-bold font-heading text-foreground mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent" />
                <span>Band 9 Blueprint Writing Structures</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                {/* Task 1 Structure */}
                <div className="glass-card rounded-2xl p-5 border border-border flex flex-col gap-3">
                  <span className="font-bold text-accent uppercase tracking-wider text-[11px]">
                    Task 1 Academic Blueprint (150+ Words &bull; 20 Mins)
                  </span>
                  <div className="space-y-2 text-muted leading-relaxed">
                    <p>
                      <strong className="text-foreground">1. Introduction:</strong> Paraphrase the prompt in 1–2 sentences using synonyms (e.g. <em>"The line graph depicts the proportion of..."</em>).
                    </p>
                    <p>
                      <strong className="text-foreground">2. Overview (Crucial):</strong> Identify 2–3 overarching macro trends, highs, or lows without quoting raw data figures.
                    </p>
                    <p>
                      <strong className="text-foreground">3. Body Paragraph 1:</strong> Detail key categories/years with precise numerical support and comparative discourse markers.
                    </p>
                    <p>
                      <strong className="text-foreground">4. Body Paragraph 2:</strong> Report contrasting trends and residual datasets with clear progression.
                    </p>
                  </div>
                </div>

                {/* Task 2 Structure */}
                <div className="glass-card rounded-2xl p-5 border border-border flex flex-col gap-3">
                  <span className="font-bold text-accent uppercase tracking-wider text-[11px]">
                    Task 2 Essay Blueprint (250+ Words &bull; 40 Mins)
                  </span>
                  <div className="space-y-2 text-muted leading-relaxed">
                    <p>
                      <strong className="text-foreground">1. Introduction:</strong> Hook/Paraphrase the controversy + unambiguous thesis statement declaring your exact stance.
                    </p>
                    <p>
                      <strong className="text-foreground">2. Body 1 (PEEL):</strong> Point &rarr; Explanation &rarr; Empirical Evidence / Example &rarr; Link back to thesis.
                    </p>
                    <p>
                      <strong className="text-foreground">3. Body 2 (Counter/Deepen):</strong> Introduce counter-perspective or secondary argument with nuance and synthesis.
                    </p>
                    <p>
                      <strong className="text-foreground">4. Conclusion:</strong> Summarize main reasons and deliver a final predictive synthesis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 3. SERVER-SIDE 15-MINUTE LOCKDOWN OVERLAY & APPEAL GATE */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl"
          >
            <motion.div
              variants={fadeInScaleVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-md glass-card rounded-3xl p-8 border border-red-500/30 shadow-2xl flex flex-col items-center text-center"
            >
              {/* Alert Icon */}
              <div className="w-16 h-16 rounded-3xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500 mb-5 shadow-lg shadow-red-500/20">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-red-500">
                Exam Security Lockdown
              </span>
              <h2 className="text-xl font-bold font-heading text-foreground mt-1 mb-2">
                Session Terminated for Tab Switching
              </h2>
              <p className="text-xs text-muted leading-relaxed mb-6">
                Three consecutive screen or tab violations were detected during your exam simulation. Your test was recorded as a violation and access is temporarily restricted.
              </p>

              {/* Countdown Wheel Box */}
              <div className="w-full py-4 rounded-2xl bg-surfaceSecondary/80 border border-border flex flex-col items-center mb-6">
                <span className="text-[10px] uppercase font-bold text-muted">
                  Lockout Expires In
                </span>
                <span className="text-3xl font-extrabold font-mono text-foreground mt-0.5">
                  {formatCountdown(remainingLockSeconds)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-2">
                <motion.button
                  {...tactilePress}
                  onClick={() => setIsAppealModalOpen(true)}
                  className="w-full py-3 rounded-xl bg-[#E31837] text-white font-semibold text-xs shadow-md shadow-[#E31837]/25 hover:bg-[#BE123C] transition-colors"
                >
                  Locked by mistake? Contact Support
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. APPEAL BOTTOM SHEET MODAL */}
      <AnimatePresence>
        {isAppealModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsAppealModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              variants={bottomSheetVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative z-10 w-full max-w-lg glass-card rounded-t-3xl sm:rounded-3xl p-6 border border-border/80 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                <h3 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-accent" />
                  <span>Submit Lockdown Appeal</span>
                </h3>
                <button
                  onClick={() => setIsAppealModalOpen(false)}
                  className="p-1 rounded-lg text-muted hover:text-foreground"
                >
                  &times;
                </button>
              </div>

              {appealSuccess ? (
                <div className="py-8 text-center text-xs text-emerald-500 font-semibold flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8" />
                  <span>Appeal submitted successfully. Administrator has been notified.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitAppeal} className="space-y-4">
                  <p className="text-xs text-muted leading-relaxed">
                    If your test was interrupted by a technical issue or unexpected browser popup, submit a concise explanation (max 200 characters) for review.
                  </p>

                  <textarea
                    required
                    maxLength={200}
                    value={appealMessage}
                    onChange={(e) => setAppealMessage(e.target.value)}
                    placeholder="Describe what occurred (e.g., system alert popped up)..."
                    className="w-full h-24 p-3 rounded-xl glass-input text-xs resize-none"
                  />

                  <div className="flex justify-between items-center text-[11px] text-muted">
                    <span>{appealMessage.length} / 200 characters</span>
                    <button
                      type="submit"
                      disabled={isSubmittingAppeal || !appealMessage.trim()}
                      className="px-4 py-2 rounded-xl bg-accent text-white font-semibold text-xs disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isSubmittingAppeal ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <span>Submit Appeal</span>
                          <Send className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. EVALUATION REVIEW MODAL */}
      {reviewModalData.isOpen && reviewModalData.submission && (
        <EvaluationReviewModal
          isOpen={reviewModalData.isOpen}
          onClose={() =>
            setReviewModalData({ isOpen: false, submission: null, task: null })
          }
          submissionId={reviewModalData.submission.id}
          taskId={reviewModalData.submission.task_id}
          taskTitle={reviewModalData.task?.title || "IELTS Writing Test"}
          taskType={reviewModalData.task?.task_type || "task_2"}
          essayText={reviewModalData.submission.essay_text || reviewModalData.submission.student_essay || ""}
          wordCount={reviewModalData.submission.word_count}
          overallBand={Number(reviewModalData.submission.overall_band) || 7.0}
          criteriaScores={
            reviewModalData.submission.criteria_scores || {
              task_achievement: 7.0,
              coherence: 7.0,
              lexical: 7.0,
              grammar: 7.0,
            }
          }
          corrections={reviewModalData.submission.corrections || []}
          defaultLanguage={nativeLanguage}
          modelAnswer={reviewModalData.task?.model_answer || null}
        />
      )}

      {/* 6. IN-APP ASSET VIEWER MODAL */}
      <AnimatePresence>
        {viewerFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setViewerFile(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              variants={fadeInScaleVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative z-10 w-full max-w-5xl glass-card rounded-3xl p-5 sm:p-6 border border-border/80 shadow-2xl flex flex-col max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border/80 gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                    {viewerFile.file_type === "pdf" ? (
                      <FileText className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold font-heading text-sm sm:text-base text-foreground truncate">
                      {viewerFile.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-muted">
                      <span className="uppercase font-semibold tracking-wider text-accent">
                        {viewerFile.file_type}
                      </span>
                      <span>&bull;</span>
                      <span>{formatFileSize(viewerFile.file_size)}</span>
                      {viewerFile.category && (
                        <>
                          <span>&bull;</span>
                          <span className="capitalize">
                            {viewerFile.category.replace(/_/g, " ")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`${viewerFile.file_url}?download=1`}
                    download={viewerFile.file_name}
                    className="px-3.5 py-2 rounded-xl bg-accent text-white text-xs font-semibold shadow-md shadow-accent/20 hover:bg-accent/90 transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download File</span>
                  </a>
                  <button
                    onClick={() => setViewerFile(null)}
                    className="p-2 rounded-xl bg-surfaceSecondary hover:bg-border text-muted hover:text-foreground transition-all"
                    title="Close Viewer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body / Viewer */}
              <div className="flex-1 overflow-hidden mt-4 rounded-2xl border border-border/60 bg-black/10 flex items-center justify-center min-h-[50vh]">
                {viewerFile.file_type === "pdf" ? (
                  <iframe
                    src={viewerFile.file_url}
                    className="w-full h-[70vh] rounded-2xl bg-white border-0"
                    title={viewerFile.title}
                  />
                ) : (
                  <div className="w-full h-[70vh] flex items-center justify-center p-4">
                    <img
                      src={viewerFile.file_url}
                      alt={viewerFile.title}
                      className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-muted border-t border-border">
        IELTSPen Ai &bull; <strong className="font-heading text-foreground">WRITE SMARTER. SCORE HIGHER.</strong>
      </footer>
    </div>
  );
}
