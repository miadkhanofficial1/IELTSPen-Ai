"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
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
  LayoutDashboard,
  FileText,
  Calendar as CalendarIcon,
  Award,
  Sparkles,
  FolderDown,
  Settings,
  User,
  Search,
  Bookmark,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  CheckCircle2,
  Clock,
  ArrowRight,
  RotateCcw,
  Shield,
  ShieldAlert,
  Sun,
  Moon,
  LogOut,
  Languages,
  Download,
  Eye,
  BookOpen,
  Lock,
  Layers,
  Send,
  Loader2,
  Info,
  Lightbulb,
  File,
  X,
  Flame,
  Trophy,
  Target,
  TrendingUp,
  Brain,
  Check,
  Star,
  Compass,
  Crown,
  Share2,
  ExternalLink,
  Plus,
  Trash2,
  Volume2,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Bot,
  BookMarked,
  Filter,
  CheckSquare,
  Square,
  CornerDownLeft,
  RefreshCw,
} from "lucide-react";
import EvaluationReviewModal from "@/components/results/EvaluationReviewModal";
import {
  WritingTask,
  Submission,
  FreeAssetFile,
  StudyAsset,
  SavedVocabularyItem,
  StudyEvent,
  DailyReflection,
  StudyArticle,
  AiTutorMessage,
  StudyEventCategory,
} from "@/lib/types";

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
  const [userEmail, setUserEmail] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isProfilePublic, setIsProfilePublic] = useState(true);
  const [userRole, setUserRole] = useState("student");
  const [userCreatedAt, setUserCreatedAt] = useState<string | null>(null);
  const [nativeLanguage, setNativeLanguage] = useState("English");
  const [meritScore, setMeritScore] = useState(100);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [globalAnnouncement, setGlobalAnnouncement] = useState<string | null>(null);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "practice" | "calendar" | "assets" | "achievements" | "deepstudy"
  >("dashboard");

  // Practice Browser folder state
  const [practiceFolder, setPracticeFolder] = useState<
    "all" | "task_1" | "task_2" | "completed" | "favorites"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Data collections
  const [tasks, setTasks] = useState<WritingTask[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick search reference
  const searchRef = useRef<HTMLInputElement>(null);

  // User card popover menu
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Settings Modal state
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"general" | "account" | "language">("general");
  const [editFullName, setEditFullName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editIsProfilePublic, setEditIsProfilePublic] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Heatmap & Analytics state
  const [heatmapMetric, setHeatmapMetric] = useState<"tests" | "time">("tests");
  const [hoveredHeatmapDay, setHoveredHeatmapDay] = useState<{
    date: string;
    count: number;
    minutes: number;
  } | null>(null);

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
  const [assetSubTab, setAssetSubTab] = useState<"files" | "vocabulary" | "articles" | "grammar" | "tricks">("files");
  const [freeAssetFiles, setFreeAssetFiles] = useState<FreeAssetFile[]>([]);
  const [studyVocabulary, setStudyVocabulary] = useState<StudyAsset[]>([]);
  const [studyGrammar, setStudyGrammar] = useState<StudyAsset[]>([]);
  const [studyTricks, setStudyTricks] = useState<StudyAsset[]>([]);
  const [isLoadingStudyAssets, setIsLoadingStudyAssets] = useState<boolean>(false);
  const [viewerFile, setViewerFile] = useState<FreeAssetFile | null>(null);
  const [assetCategoryFilter, setAssetCategoryFilter] = useState<string>("all");

  // Mini calendar state
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

  // --- Phase 3: Saved Vocabulary & Flashcard Review ---
  const [savedVocabList, setSavedVocabList] = useState<SavedVocabularyItem[]>([]);
  const [vocabCategoryFilter, setVocabCategoryFilter] = useState<string>("all");
  const [isFlashcardMode, setIsFlashcardMode] = useState<boolean>(false);
  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  const [isAddWordModalOpen, setIsAddWordModalOpen] = useState<boolean>(false);
  const [newWord, setNewWord] = useState<string>("");
  const [newMeaningEn, setNewMeaningEn] = useState<string>("");
  const [newMeaningNative, setNewMeaningNative] = useState<string>("");
  const [newExample, setNewExample] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("General Academic");
  const [isSavingManualWord, setIsSavingManualWord] = useState<boolean>(false);
  const [isReviewingCard, setIsReviewingCard] = useState<boolean>(false);

  // --- Phase 3: Study Calendar & Daily Reflection ---
  const [calendarEvents, setCalendarEvents] = useState<StudyEvent[]>([]);
  const [selectedEventDate, setSelectedEventDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState<boolean>(false);
  const [newEventTitle, setNewEventTitle] = useState<string>("");
  const [newEventCategory, setNewEventCategory] = useState<StudyEventCategory>("Study");
  const [newEventDate, setNewEventDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [newEventStartTime, setNewEventStartTime] = useState<string>("10:00");
  const [newEventEndTime, setNewEventEndTime] = useState<string>("11:00");
  const [isCreatingEvent, setIsCreatingEvent] = useState<boolean>(false);
  const [dailyGoal, setDailyGoal] = useState<string>("");
  const [dailyReflectionText, setDailyReflectionText] = useState<string>("");
  const [isSavingReflection, setIsSavingReflection] = useState<boolean>(false);
  const [reflectionSavedToast, setReflectionSavedToast] = useState<boolean>(false);

  // --- Phase 3: Study Articles & One-Click Word Saver ---
  const [studentArticles, setStudentArticles] = useState<StudyArticle[]>([]);
  const [readingArticle, setReadingArticle] = useState<StudyArticle | null>(null);
  const [selectedWordLookup, setSelectedWordLookup] = useState<{
    word: string;
    definition_en: string;
    definition_native: string;
    part_of_speech?: string;
    example?: string;
  } | null>(null);
  const [isLookingUpWord, setIsLookingUpWord] = useState<boolean>(false);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [isSavingWordFromArticle, setIsSavingWordFromArticle] = useState<boolean>(false);
  const [wordSavedSuccess, setWordSavedSuccess] = useState<string | null>(null);

  // --- Phase 3: DeepStudy AI Writing Tutor ---
  const [aiTutorMessages, setAiTutorMessages] = useState<AiTutorMessage[]>([
    {
      role: "assistant",
      content:
        "Welcome to **DeepStudy AI Writing Tutor**! I am your Cambridge-calibrated IELTS Writing coach. How can I assist your writing preparation today? You can brainstorm essay ideas, request thesis statement feedback, refine vocabulary, or ask for sentence paraphrasing.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [aiTutorInput, setAiTutorInput] = useState<string>("");
  const [isAiTutorThinking, setIsAiTutorThinking] = useState<boolean>(false);
  const [aiTutorMode, setAiTutorMode] = useState<
    "general" | "brainstorm" | "thesis" | "paraphrase" | "grammar"
  >("general");

  // 1. Load initial favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ieltspen_favorites");
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) {
          setFavorites(new Set(arr));
        }
      }
    } catch (e) {}
  }, []);

  // 2. Toggle favorite task
  const toggleFavorite = (taskId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      try {
        localStorage.setItem("ieltspen_favorites", JSON.stringify(Array.from(next)));
      } catch (err) {}
      return next;
    });
  };

  // 3. Quick Search Keyboard Shortcut ('F')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "f" || e.key === "F") && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const activeEl = document.activeElement;
        const isInput =
          activeEl &&
          (activeEl.tagName === "INPUT" ||
            activeEl.tagName === "TEXTAREA" ||
            (activeEl as HTMLElement).isContentEditable);
        if (!isInput) {
          e.preventDefault();
          searchRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 4. Click outside to close user menu popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 5. Load study assets from API
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

  // 6. Initialize and load dashboard data
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
          if (data.profile.full_name) {
            setUserName(data.profile.full_name);
            setEditFullName(data.profile.full_name);
          }
          if (data.profile.email) setUserEmail(data.profile.email);
          if (data.profile.username) {
            setUsername(data.profile.username);
            setEditUsername(data.profile.username);
          } else if (data.profile.email) {
            const fallback = data.profile.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
            setUsername(fallback);
            setEditUsername(fallback);
          }
          if (data.profile.bio) {
            setBio(data.profile.bio);
            setEditBio(data.profile.bio);
          }
          if (data.profile.is_profile_public !== undefined) {
            setIsProfilePublic(Boolean(data.profile.is_profile_public));
            setEditIsProfilePublic(Boolean(data.profile.is_profile_public));
          }
          if (data.profile.role) setUserRole(data.profile.role);
          if (data.profile.created_at) setUserCreatedAt(data.profile.created_at);
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

        loadStudyAssets(data.profile?.native_language || "English");
        loadSavedVocabulary();
        loadCalendarEvents(new Date().getFullYear(), new Date().getMonth() + 1);
        loadDailyReflection(new Date().toISOString().split("T")[0]);
        loadStudentArticles();
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();

    // Lightweight status polling
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
      } catch (e) {}
    }, lockedUntil ? 4000 : 12000);

    return () => clearInterval(pollInterval);
  }, [router, lockedUntil]);

  // 7. Handle countdown calculation for locked_until
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

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 8. Update native language
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

  // --- Phase 3 Handlers ---
  const loadSavedVocabulary = async () => {
    try {
      const res = await fetch("/api/student/vocabulary");
      if (res.ok) {
        const data = await res.json();
        if (data.vocabulary) setSavedVocabList(data.vocabulary);
      }
    } catch (e) {
      console.warn("Failed to load vocabulary:", e);
    }
  };

  const handleSaveManualWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newMeaningEn.trim()) return;
    setIsSavingManualWord(true);
    try {
      const res = await fetch("/api/student/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: newWord.trim(),
          meaning_en: newMeaningEn.trim(),
          meaning_native: newMeaningNative.trim() || undefined,
          example_sentence: newExample.trim() || undefined,
          topic_category: newCategory,
        }),
      });
      if (res.ok) {
        setIsAddWordModalOpen(false);
        setNewWord("");
        setNewMeaningEn("");
        setNewMeaningNative("");
        setNewExample("");
        await loadSavedVocabulary();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save word.");
      }
    } catch (e) {
      alert("Error saving word.");
    } finally {
      setIsSavingManualWord(false);
    }
  };

  const handleDeleteWord = async (vocabId: string) => {
    try {
      const res = await fetch(`/api/student/vocabulary?id=${vocabId}`, { method: "DELETE" });
      if (res.ok) {
        setSavedVocabList((prev) => prev.filter((v) => v.id !== vocabId));
      }
    } catch (e) {
      console.warn("Delete word failed:", e);
    }
  };

  const handleReviewCard = async (rating: "again" | "hard" | "good" | "easy") => {
    if (savedVocabList.length === 0 || isReviewingCard) return;
    const currentCard = savedVocabList[flashcardIndex];
    if (!currentCard) return;

    setIsReviewingCard(true);
    try {
      await fetch("/api/student/vocabulary/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vocab_id: currentCard.id, rating }),
      });

      setIsCardFlipped(false);
      if (flashcardIndex + 1 < savedVocabList.length) {
        setFlashcardIndex((prev) => prev + 1);
      } else {
        setFlashcardIndex(0);
        alert("Review session complete! Great work on your vocabulary mastery.");
        setIsFlashcardMode(false);
      }
      await loadSavedVocabulary();
    } catch (e) {
      console.warn("Review error:", e);
    } finally {
      setIsReviewingCard(false);
    }
  };

  const loadCalendarEvents = async (year: number, month: number) => {
    try {
      const res = await fetch(`/api/student/calendar?year=${year}&month=${month}`);
      if (res.ok) {
        const data = await res.json();
        if (data.events) setCalendarEvents(data.events);
      }
    } catch (e) {
      console.warn("Failed to load events:", e);
    }
  };

  const loadDailyReflection = async (dateStr: string) => {
    try {
      const res = await fetch(`/api/student/reflections?date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        if (data.reflection) {
          setDailyGoal(data.reflection.daily_goal || "");
          setDailyReflectionText(data.reflection.reflection_text || "");
        } else {
          setDailyGoal("");
          setDailyReflectionText("");
        }
      }
    } catch (e) {
      console.warn("Failed to load daily reflection:", e);
    }
  };

  const handleCreateCalendarEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    setIsCreatingEvent(true);
    try {
      const res = await fetch("/api/student/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newEventTitle.trim(),
          category: newEventCategory,
          event_date: newEventDate,
          start_time: newEventStartTime || undefined,
          end_time: newEventEndTime || undefined,
        }),
      });
      if (res.ok) {
        setIsNewEventModalOpen(false);
        setNewEventTitle("");
        await loadCalendarEvents(calendarYear, calendarMonth + 1);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create event.");
      }
    } catch (e) {
      alert("Error creating event.");
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleToggleEventCompleted = async (eventId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/student/calendar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: eventId, is_completed: !currentStatus }),
      });
      if (res.ok) {
        setCalendarEvents((prev) =>
          prev.map((ev) => (ev.id === eventId ? { ...ev, is_completed: !currentStatus } : ev))
        );
      }
    } catch (e) {
      console.warn("Failed to toggle event:", e);
    }
  };

  const handleDeleteCalendarEvent = async (eventId: string) => {
    try {
      const res = await fetch(`/api/student/calendar?id=${eventId}`, { method: "DELETE" });
      if (res.ok) {
        setCalendarEvents((prev) => prev.filter((ev) => ev.id !== eventId));
      }
    } catch (e) {
      console.warn("Failed to delete event:", e);
    }
  };

  const handleSaveDailyReflection = async () => {
    setIsSavingReflection(true);
    try {
      const res = await fetch("/api/student/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reflection_date: selectedEventDate,
          daily_goal: dailyGoal.trim() || undefined,
          reflection_text: dailyReflectionText.trim() || undefined,
        }),
      });
      if (res.ok) {
        setReflectionSavedToast(true);
        setTimeout(() => setReflectionSavedToast(false), 2000);
      }
    } catch (e) {
      console.warn("Save reflection error:", e);
    } finally {
      setIsSavingReflection(false);
    }
  };

  const loadStudentArticles = async () => {
    try {
      const res = await fetch("/api/student/articles");
      if (res.ok) {
        const data = await res.json();
        if (data.articles) setStudentArticles(data.articles);
      }
    } catch (e) {
      console.warn("Load articles error:", e);
    }
  };

  const handleWordClickInArticle = async (word: string, contextSentence: string, e: React.MouseEvent) => {
    const clean = word.replace(/[^a-zA-Z-]/g, "").trim();
    if (!clean || clean.length < 2) return;

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltipPos({ x: rect.left, y: rect.bottom + window.scrollY + 6 });
    setIsLookingUpWord(true);
    setSelectedWordLookup(null);

    try {
      const res = await fetch("/api/student/word-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: clean,
          contextSentence,
          targetLanguage: nativeLanguage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedWordLookup(data);
      }
    } catch (err) {
      console.warn("Word lookup error:", err);
    } finally {
      setIsLookingUpWord(false);
    }
  };

  const handleSaveWordFromLookup = async () => {
    if (!selectedWordLookup) return;
    setIsSavingWordFromArticle(true);
    try {
      const res = await fetch("/api/student/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: selectedWordLookup.word,
          meaning_en: selectedWordLookup.definition_en,
          meaning_native: selectedWordLookup.definition_native,
          example_sentence: selectedWordLookup.example,
          topic_category: readingArticle?.category || "General Academic",
        }),
      });
      if (res.ok) {
        setWordSavedSuccess(selectedWordLookup.word);
        setTimeout(() => setWordSavedSuccess(null), 2500);
        await loadSavedVocabulary();
      }
    } catch (e) {
      console.warn("Failed to save word:", e);
    } finally {
      setIsSavingWordFromArticle(false);
    }
  };

  const handleSendAiTutorMessage = async () => {
    if (!aiTutorInput.trim() || isAiTutorThinking) return;
    const userText = aiTutorInput.trim();
    setAiTutorInput("");

    const userMsg: AiTutorMessage = {
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setAiTutorMessages((prev) => [...prev, userMsg]);
    setIsAiTutorThinking(true);

    try {
      const historyToSend = [...aiTutorMessages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/student/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyToSend,
          mode: aiTutorMode,
          nativeLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAiTutorMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "Could not generate response. Please try again.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        return;
      }

      setAiTutorMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (e) {
      setAiTutorMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Connection to DeepStudy AI Tutor interrupted. Please retry.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsAiTutorThinking(false);
    }
  };

  // 9. Save settings from modal
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    setSettingsError(null);
    try {
      const cleanUsername = editUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
      const res = await fetch("/api/student/dashboard-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: editFullName.trim(),
          username: cleanUsername || undefined,
          bio: editBio.trim(),
          isProfilePublic: editIsProfilePublic,
          nativeLanguage,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        setSettingsError(resData.error || "Failed to update profile settings.");
        return;
      }

      setUserName(editFullName.trim() || userName);
      if (cleanUsername) setUsername(cleanUsername);
      setBio(editBio.trim());
      setIsProfilePublic(editIsProfilePublic);
      setSettingsSavedToast(true);
      setTimeout(() => setSettingsSavedToast(false), 2500);
    } catch (err: any) {
      console.error("Save settings error:", err);
      setSettingsError(err.message || "Failed to save settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // 10. Handle Sign Out
  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Sign out error:", err);
    }
    router.push("/");
  };

  // 11. Handle unlock appeal submission
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

  // 12. Submissions Maps
  const completedTaskMap = useMemo(() => {
    const map = new Map<string, Submission>();
    submissions.forEach((s) => {
      if (s.status === "completed" && !map.has(s.task_id)) {
        map.set(s.task_id, s);
      }
    });
    return map;
  }, [submissions]);

  const failedCheatTaskMap = useMemo(() => {
    const map = new Map<string, Submission>();
    submissions.forEach((s) => {
      if (s.status === "failed_cheat" && !map.has(s.task_id)) {
        map.set(s.task_id, s);
      }
    });
    return map;
  }, [submissions]);

  // 13. Real module statistics from TiDB submissions
  const completedSubmissions = useMemo(
    () => submissions.filter((s) => s.status === "completed"),
    [submissions]
  );

  const task1Completed = useMemo(() => {
    return completedSubmissions.filter((s) => {
      const task = tasks.find((t) => t.id === s.task_id);
      return task?.task_type === "task_1";
    });
  }, [completedSubmissions, tasks]);

  const task2Completed = useMemo(() => {
    return completedSubmissions.filter((s) => {
      const task = tasks.find((t) => t.id === s.task_id);
      return task?.task_type === "task_2";
    });
  }, [completedSubmissions, tasks]);

  const avgTask1Band = useMemo(() => {
    if (task1Completed.length === 0) return null;
    const sum = task1Completed.reduce((acc, s) => acc + (Number(s.overall_band) || 0), 0);
    return (sum / task1Completed.length).toFixed(1);
  }, [task1Completed]);

  const avgTask2Band = useMemo(() => {
    if (task2Completed.length === 0) return null;
    const sum = task2Completed.reduce((acc, s) => acc + (Number(s.overall_band) || 0), 0);
    return (sum / task2Completed.length).toFixed(1);
  }, [task2Completed]);

  const totalStudyMinutes = useMemo(() => {
    // 20 mins for Task 1, 40 mins for Task 2
    return task1Completed.length * 20 + task2Completed.length * 40;
  }, [task1Completed, task2Completed]);

  // User consecutive streak calculation
  const userStreak = useMemo(() => {
    const dates = Array.from(
      new Set(
        completedSubmissions
          .filter((s) => s.created_at)
          .map((s) => new Date(s.created_at).toISOString().split("T")[0])
      )
    ).sort().reverse();

    if (dates.length === 0) return 0;
    const todayStrIso = new Date().toISOString().split("T")[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStrIso = yesterdayDate.toISOString().split("T")[0];

    if (dates[0] !== todayStrIso && dates[0] !== yesterdayStrIso) return 0;

    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff = Math.round((prev.getTime() - curr.getTime()) / (1000 * 3600 * 24));
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [completedSubmissions]);

  // Total words/assets saved
  const totalWordsSaved = useMemo(() => {
    return studyVocabulary.length + studyGrammar.length + studyTricks.length;
  }, [studyVocabulary, studyGrammar, studyTricks]);

  // Highest Band achieved
  const highestBand = useMemo(() => {
    if (completedSubmissions.length === 0) return 0;
    return Math.max(...completedSubmissions.map((s) => Number(s.overall_band) || 0));
  }, [completedSubmissions]);

  // "Your Week" 7-Day Bar Chart data
  const weekDaysData = useMemo(() => {
    const list: Array<{
      dateStr: string;
      dayLabel: string;
      minutes: number;
      isToday: boolean;
      testsCount: number;
    }> = [];

    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" });
      const isToday = i === 0;

      const daySubs = completedSubmissions.filter((s) => {
        if (!s.created_at) return false;
        return new Date(s.created_at).toISOString().split("T")[0] === dateStr;
      });

      const testsCount = daySubs.length;
      const minutes = daySubs.reduce((acc, s) => {
        const dur = Number(s.time_spent_seconds) || 1200;
        return acc + Math.round(dur / 60);
      }, 0);

      list.push({ dateStr, dayLabel, minutes, isToday, testsCount });
    }
    return list;
  }, [completedSubmissions]);

  // Chronological Band Trend Data
  const chronologicalTrend = useMemo(() => {
    return [...completedSubmissions]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((s) => {
        const task = tasks.find((t) => t.id === s.task_id);
        return {
          id: s.id,
          title: task?.title || "Cambridge Simulation",
          taskType: task?.task_type || "task_2",
          band: Number(s.overall_band) || 0,
          wordCount: s.word_count,
          date: s.created_at,
        };
      });
  }, [completedSubmissions, tasks]);

  // 2026 Heatmap Days & Weeks
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

    const dateMap: Record<string, { count: number; minutes: number }> = {};
    completedSubmissions.forEach((s) => {
      if (!s.created_at) return;
      const dStr = new Date(s.created_at).toISOString().split("T")[0];
      if (!dateMap[dStr]) dateMap[dStr] = { count: 0, minutes: 0 };
      dateMap[dStr].count += 1;
      dateMap[dStr].minutes += Math.round((Number(s.time_spent_seconds) || 1200) / 60);
    });

    while (cur <= endDate) {
      const dateStr = cur.toISOString().split("T")[0];
      const activity = dateMap[dateStr];
      const count = activity?.count || 0;
      const minutes = activity?.minutes || 0;

      days.push({
        date: dateStr,
        count,
        minutes,
        month: cur.getMonth(),
        dayOfWeek: cur.getDay(),
      });

      cur.setDate(cur.getDate() + 1);
    }

    return days;
  }, [completedSubmissions]);

  const heatmapWeeks = useMemo(() => {
    const weeks: Array<typeof heatmapDays> = [];
    let currentWeek: typeof heatmapDays = [];

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

  // 9 Milestone Medals
  const milestoneMedals = useMemo(() => {
    return [
      {
        id: "spark",
        name: "Spark",
        category: "Streak",
        desc: "Maintain a 3-day active writing streak.",
        threshold: 3,
        current: userStreak,
        unlocked: userStreak >= 3,
        icon: Flame,
      },
      {
        id: "week_of_fire",
        name: "Week of Fire",
        category: "Streak",
        desc: "Maintain a 7-day active writing streak.",
        threshold: 7,
        current: userStreak,
        unlocked: userStreak >= 7,
        icon: Flame,
      },
      {
        id: "fortnight_flame",
        name: "Fortnight Flame",
        category: "Streak",
        desc: "Maintain a 14-day active writing streak.",
        threshold: 14,
        current: userStreak,
        unlocked: userStreak >= 14,
        icon: Flame,
      },
      {
        id: "month_of_fire",
        name: "Month of Fire",
        category: "Streak",
        desc: "Maintain a 30-day active writing streak.",
        threshold: 30,
        current: userStreak,
        unlocked: userStreak >= 30,
        icon: Flame,
      },
      {
        id: "first_essay",
        name: "First Essay",
        category: "Essays",
        desc: "Complete your first timed writing evaluation.",
        threshold: 1,
        current: completedSubmissions.length,
        unlocked: completedSubmissions.length >= 1,
        icon: Award,
      },
      {
        id: "dedicated_writer",
        name: "Dedicated Writer",
        category: "Essays",
        desc: "Complete 10 full IELTS writing simulations.",
        threshold: 10,
        current: completedSubmissions.length,
        unlocked: completedSubmissions.length >= 10,
        icon: Trophy,
      },
      {
        id: "band_7_achiever",
        name: "Band 7.0+ Achiever",
        category: "Band",
        desc: "Score Band 7.0 or higher on an official test.",
        threshold: 7.0,
        current: highestBand,
        unlocked: highestBand >= 7.0,
        icon: Star,
      },
      {
        id: "band_8_master",
        name: "Band 8.0+ Master",
        category: "Band",
        desc: "Score Band 8.0 or higher on an official test.",
        threshold: 8.0,
        current: highestBand,
        unlocked: highestBand >= 8.0,
        icon: Crown,
      },
      {
        id: "vocabulary_builder",
        name: "Vocabulary Builder",
        category: "Vocabulary",
        desc: "Save 20 study takeaways or vocabulary cards.",
        threshold: 20,
        current: totalWordsSaved,
        unlocked: totalWordsSaved >= 20,
        icon: BookOpen,
      },
    ];
  }, [userStreak, completedSubmissions.length, highestBand, totalWordsSaved]);

  // 14. Practice categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.topic_category) set.add(t.topic_category);
    });
    return Array.from(set);
  }, [tasks]);

  // 15. Filtered practice tasks based on folder + search + category
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const isCompleted = completedTaskMap.has(t.id);
      const isFav = favorites.has(t.id);

      // Folder filter
      if (practiceFolder === "task_1" && t.task_type !== "task_1") return false;
      if (practiceFolder === "task_2" && t.task_type !== "task_2") return false;
      if (practiceFolder === "completed" && !isCompleted) return false;
      if (practiceFolder === "favorites" && !isFav) return false;

      // Category filter
      if (categoryFilter !== "all" && t.topic_category !== categoryFilter) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchPrompt = t.prompt_text.toLowerCase().includes(q);
        const matchCategory = t.topic_category.toLowerCase().includes(q);
        if (!matchTitle && !matchPrompt && !matchCategory) return false;
      }

      return true;
    });
  }, [tasks, practiceFolder, categoryFilter, searchQuery, completedTaskMap, favorites]);

  // 16. Free Assets helpers
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

  const filteredFiles = useMemo(() => {
    if (assetCategoryFilter === "all") return freeAssetFiles;
    return freeAssetFiles.filter((f) => f.category === assetCategoryFilter);
  }, [freeAssetFiles, assetCategoryFilter]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 17. Mini Calendar Helpers
  const calendarYear = calendarDate.getFullYear();
  const calendarMonth = calendarDate.getMonth();
  const monthName = calendarDate.toLocaleString("default", { month: "long" });

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();

  // Completed submission dates set (formatted YYYY-MM-DD)
  const completedDateSet = useMemo(() => {
    const set = new Set<string>();
    completedSubmissions.forEach((s) => {
      const d = new Date(s.created_at);
      set.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    });
    return set;
  }, [completedSubmissions]);

  // Today's date string
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  // User initials
  const userInitials = useMemo(() => {
    if (!userName) return "SC";
    const parts = userName.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }, [userName]);

  return (
    <div className="flex min-h-screen w-full bg-background selection:bg-accent/20 selection:text-accent relative">
      {/* =========================================================================
          1. FIXED FULL-HEIGHT FROSTED GLASS LEFT SIDEBAR
      ========================================================================= */}
      <aside className="fixed inset-y-0 left-0 w-64 h-screen shrink-0 glass-nav flex flex-col justify-between overflow-y-auto border-r border-border z-30 bg-surface/90 backdrop-blur-xl">
        <div className="flex flex-col">
          {/* Top Brand Logo Block: Clean Left-Aligned with proper padding and border-b */}
          <div className="px-5 pt-5 pb-4 border-b border-border/60">
            <Link href="/" className="flex flex-col items-start text-left group">
              <div className="flex items-center justify-start">
                <BrandLogo variant="auto" showSlogan={false} height={28} className="w-auto" />
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent font-mono">
                  Student Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Search Bar with 'F' Shortcut */}
          <div className="p-3.5 border-b border-border/40">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-muted absolute left-3 pointer-events-none" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Find a test..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== "practice") {
                    setActiveTab("practice");
                  }
                }}
                className="w-full pl-8 pr-8 py-2 rounded-xl glass-input text-xs font-medium placeholder:text-muted/70 focus:outline-none focus:ring-1 focus:ring-accent transition-all"
              />
              <kbd className="absolute right-2 px-1.5 py-0.5 rounded bg-surfaceSecondary text-[10px] font-mono font-semibold text-muted border border-border pointer-events-none">
                F
              </kbd>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="p-3 space-y-1 text-xs font-semibold">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              {
                id: "practice",
                label: "Practice Tests",
                icon: FileText,
                badge: tasks.length > 0 ? tasks.length : undefined,
              },
              { id: "calendar", label: "Calendar & Planner", icon: CalendarIcon },
              {
                id: "assets",
                label: "Free Assets",
                icon: FolderDown,
                badge: freeAssetFiles.length > 0 ? freeAssetFiles.length : undefined,
              },
              {
                id: "achievements",
                label: "Achievements",
                icon: Award,
                badge: completedSubmissions.length > 0 ? completedSubmissions.length : undefined,
              },
              { id: "deepstudy", label: "DeepStudy AI", icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between transition-all ${
                    isSelected
                      ? "bg-[#E31837] text-white shadow-md shadow-[#E31837]/25 font-bold"
                      : "text-muted hover:text-foreground hover:bg-surfaceSecondary font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>

                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isSelected ? "bg-white text-accent" : "bg-accent/15 text-accent"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Card & Popover Menu */}
        <div className="p-3 border-t border-border shrink-0 bg-surface/40 backdrop-blur-md relative" ref={userMenuRef}>
          {/* User Popover Trigger */}
          <button
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="w-full p-2 rounded-2xl glass-pill hover:bg-surfaceSecondary border border-border/70 flex items-center justify-between text-left transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-accent to-rose-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm">
                {userInitials}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold font-heading text-foreground block truncate">
                  {userName}
                </span>
                <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {meritScore}% Merit
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-muted transition-transform shrink-0 ${
                isUserMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* User Popover Menu */}
          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={iosSpring}
                className="absolute bottom-full left-3 right-3 mb-2 rounded-2xl glass-card border border-border/80 shadow-2xl p-2 z-50 text-xs bg-surface/95 backdrop-blur-xl space-y-1"
              >
                {/* User Info Header */}
                <div className="px-3 py-2 border-b border-border/60 mb-1">
                  <span className="font-bold text-foreground block truncate">{userName}</span>
                  <span className="text-[10px] text-muted block truncate font-mono">{userEmail}</span>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-accent/10 text-accent uppercase">
                      {userRole}
                    </span>
                    <span className="text-[10px] text-muted">
                      Language: <strong className="text-foreground">{nativeLanguage}</strong>
                    </span>
                  </div>
                </div>

                {/* Popover Links */}
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setSettingsTab("account");
                    setIsSettingsModalOpen(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left font-medium text-foreground hover:bg-surfaceSecondary flex items-center gap-2 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-accent" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setSettingsTab("general");
                    setIsSettingsModalOpen(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left font-medium text-foreground hover:bg-surfaceSecondary flex items-center gap-2 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-muted" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setSettingsTab("language");
                    setIsSettingsModalOpen(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left font-medium text-foreground hover:bg-surfaceSecondary flex items-center gap-2 transition-colors"
                >
                  <Languages className="w-3.5 h-3.5 text-blue-500" />
                  <span>Native Language</span>
                </button>

                <button
                  onClick={toggleTheme}
                  className="w-full px-3 py-2 rounded-xl text-left font-medium text-foreground hover:bg-surfaceSecondary flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {theme === "dark" ? (
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Moon className="w-3.5 h-3.5 text-slate-700" />
                    )}
                    <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                  </div>
                </button>

                <div className="pt-1 border-t border-border/60">
                  <button
                    onClick={handleSignOut}
                    className="w-full px-3 py-2 rounded-xl text-left font-medium text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* =========================================================================
          2. MAIN STUDENT WORKSPACE
      ========================================================================= */}
      <div className="pl-64 flex-1 min-w-0 flex flex-col justify-between min-h-screen w-full">
        {/* Top Announcement & Security Lockout Banners */}
        <div>
          {/* Global Platform Announcement */}
          {globalAnnouncement && (
            <div className="w-full bg-accent/10 border-b border-accent/20 px-4 py-2 text-center text-xs text-accent flex items-center justify-center gap-2">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>{globalAnnouncement}</span>
            </div>
          )}

          {/* 15-Minute Exam Lockdown Alert */}
          {isLocked && (
            <div className="w-full bg-red-500/15 border-b border-red-500/30 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-red-500">
              <div className="flex items-center gap-2 font-medium">
                <ShieldAlert className="w-4 h-4 shrink-0 animate-bounce" />
                <span>
                  Exam Room Locked due to anti-cheat violation. Time remaining:{" "}
                  <strong className="font-mono text-sm underline">
                    {formatCountdown(remainingLockSeconds)}
                  </strong>
                </span>
              </div>
              <button
                onClick={() => setIsAppealModalOpen(true)}
                className="px-3 py-1 rounded-lg bg-red-500 text-white font-semibold text-xs shadow-sm hover:bg-red-600 transition-colors shrink-0"
              >
                Submit Unlock Appeal
              </button>
            </div>
          )}
        </div>

        {/* Main Content Render Area */}
        <main className="flex-1 p-5 sm:p-8 md:p-10 max-w-6xl w-full mx-auto">
          {/* -------------------------------------------------------------------
              TAB 1: HOME DASHBOARD OVERVIEW
          ------------------------------------------------------------------- */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Welcome Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
                    Welcome to IELTSPen Ai, {userName}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted mt-1 flex items-center gap-2">
                    <span>
                      {today.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span>&bull;</span>
                    <span className="text-accent font-medium">
                      Evaluated in {nativeLanguage}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setActiveTab("practice");
                      setPracticeFolder("all");
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-[#E31837] text-white font-bold text-xs shadow-lg shadow-[#E31837]/25 hover:bg-[#BE123C] transition-all flex items-center gap-2"
                  >
                    <span>Start Practice Test</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Action Cards (3 Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    setActiveTab("practice");
                    setPracticeFolder("all");
                  }}
                  className="glass-card rounded-2xl p-5 border border-border text-left hover:border-accent/40 transition-all flex flex-col justify-between group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                  <div>
                    <h3 className="font-bold font-heading text-sm text-foreground">
                      Practice Tests
                    </h3>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      Simulate 20 or 40-minute Cambridge exam conditions under lockdown.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("deepstudy")}
                  className="glass-card rounded-2xl p-5 border border-border text-left hover:border-accent/40 transition-all flex flex-col justify-between group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                  <div>
                    <h3 className="font-bold font-heading text-sm text-foreground">
                      DeepStudy AI
                    </h3>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      Instant diagnostic feedback, criterion breakdowns, and Band targets.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("assets")}
                  className="glass-card rounded-2xl p-5 border border-border text-left hover:border-accent/40 transition-all flex flex-col justify-between group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <FolderDown className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                  <div>
                    <h3 className="font-bold font-heading text-sm text-foreground">
                      Free Assets Hub
                    </h3>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      Band 9 essay blueprints, visual trend cheat sheets, and vocabulary.
                    </p>
                  </div>
                </button>
              </div>

              {/* Main Overview Grid: Left Metrics & Right Calendar/Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Columns: Real-Time Module Summary Cards */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Real Stats Cards (4 Cards) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="glass-card rounded-2xl p-4 border border-border">
                      <span className="text-[11px] font-medium text-muted block">Task 1 Avg Band</span>
                      <span className="text-2xl font-extrabold font-heading text-blue-500 mt-1 block">
                        {avgTask1Band ? `Band ${avgTask1Band}` : "—"}
                      </span>
                      <span className="text-[10px] text-muted mt-0.5 block">
                        {task1Completed.length} tests completed
                      </span>
                    </div>

                    <div className="glass-card rounded-2xl p-4 border border-border">
                      <span className="text-[11px] font-medium text-muted block">Task 2 Avg Band</span>
                      <span className="text-2xl font-extrabold font-heading text-purple-500 mt-1 block">
                        {avgTask2Band ? `Band ${avgTask2Band}` : "—"}
                      </span>
                      <span className="text-[10px] text-muted mt-0.5 block">
                        {task2Completed.length} tests completed
                      </span>
                    </div>

                    <div className="glass-card rounded-2xl p-4 border border-border">
                      <span className="text-[11px] font-medium text-muted block">Total Essays</span>
                      <span className="text-2xl font-extrabold font-heading text-foreground mt-1 block">
                        {completedSubmissions.length}
                      </span>
                      <span className="text-[10px] text-muted mt-0.5 block">
                        100% TiDB records
                      </span>
                    </div>

                    <div className="glass-card rounded-2xl p-4 border border-border">
                      <span className="text-[11px] font-medium text-muted block">Study Time</span>
                      <span className="text-2xl font-extrabold font-heading text-accent mt-1 block">
                        {totalStudyMinutes}m
                      </span>
                      <span className="text-[10px] text-muted mt-0.5 block">
                        Exam simulations
                      </span>
                    </div>
                  </div>

                  {/* Band Progress Trend Line Chart */}
                  <div className="glass-card rounded-3xl p-6 border border-border space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h2 className="text-base font-bold font-heading text-foreground flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-accent" />
                          <span>Band Progress Trend</span>
                        </h2>
                        <p className="text-xs text-muted mt-0.5">
                          Official Cambridge overall band trajectory over time
                        </p>
                      </div>

                      {chronologicalTrend.length >= 2 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-accent/10 text-accent">
                            Latest: <strong>Band {chronologicalTrend[chronologicalTrend.length - 1].band.toFixed(1)}</strong>
                          </span>
                        </div>
                      )}
                    </div>

                    {chronologicalTrend.length < 2 ? (
                      <div className="p-8 rounded-2xl glass-panel border border-border text-center flex flex-col items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-muted mb-2 opacity-60" />
                        <h4 className="font-bold text-foreground text-sm">Your trend appears after two tests</h4>
                        <p className="text-muted text-xs mt-1 max-w-sm">
                          Complete at least 2 full writing simulations to visualize your Band Score trajectory and criterion progress over time.
                        </p>
                        <button
                          onClick={() => {
                            setActiveTab("practice");
                            setPracticeFolder("all");
                          }}
                          className="mt-3 px-3.5 py-1.5 rounded-xl bg-accent text-white font-semibold text-xs shadow-sm hover:bg-accent-hover transition-colors"
                        >
                          Start Next Test
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-2">
                        {/* SVG Trend Line */}
                        <div className="relative h-40 w-full">
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
                              const pts = chronologicalTrend.map((t, idx) => {
                                const x = (idx / (chronologicalTrend.length - 1)) * 480 + 10;
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
                                    <linearGradient id="studentTrendGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#E31837" stopOpacity="0.25" />
                                      <stop offset="100%" stopColor="#E31837" stopOpacity="0.0" />
                                    </linearGradient>
                                  </defs>
                                  <path d={areaD} fill="url(#studentTrendGrad)" />
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
                                      <title>{`${p.data.title}: Band ${p.data.band} (${new Date(p.data.date).toLocaleDateString()})`}</title>
                                    </g>
                                  ))}
                                </>
                              );
                            })()}
                          </svg>
                        </div>

                        {/* X-axis indicators */}
                        <div className="flex items-center justify-between text-[10px] text-muted pt-2 border-t border-border">
                          <span>First: {new Date(chronologicalTrend[0].date).toLocaleDateString()}</span>
                          <span className="font-semibold text-foreground">
                            {chronologicalTrend.length} Tests Evaluated
                          </span>
                          <span>Latest: {new Date(chronologicalTrend[chronologicalTrend.length - 1].date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recent Completed Submissions Feed */}
                  <div className="glass-card rounded-3xl p-6 border border-border space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold font-heading text-foreground flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Recent Completed Simulations</span>
                      </h2>
                      <button
                        onClick={() => {
                          setActiveTab("practice");
                          setPracticeFolder("completed");
                        }}
                        className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                      >
                        <span>View All ({completedSubmissions.length})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {completedSubmissions.length === 0 ? (
                      <div className="p-8 rounded-2xl glass-panel border border-border text-center flex flex-col items-center">
                        <FileText className="w-8 h-8 text-muted mb-2 opacity-60" />
                        <p className="font-semibold text-foreground text-xs">No exams submitted yet</p>
                        <p className="text-muted text-[11px] mt-1 max-w-sm">
                          Select a task from the Practice Tests library to write your first Cambridge simulation.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {completedSubmissions.slice(0, 3).map((sub) => {
                          const task = tasks.find((t) => t.id === sub.task_id);
                          return (
                            <div
                              key={sub.id}
                              className="p-4 rounded-2xl glass-panel border border-border flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-accent/10 text-accent">
                                    Band {sub.overall_band?.toFixed(1) || "Done"}
                                  </span>
                                  <span className="text-muted font-medium truncate">
                                    {task?.topic_category || "IELTS Writing"}
                                  </span>
                                </div>
                                <h4 className="font-bold text-foreground truncate">
                                  {task?.title || "Exam Submission"}
                                </h4>
                                <span className="text-[10px] text-muted">
                                  {sub.word_count} words &bull;{" "}
                                  {new Date(sub.created_at).toLocaleDateString()}
                                </span>
                              </div>

                              <button
                                onClick={() => {
                                  if (task) {
                                    setReviewModalData({
                                      isOpen: true,
                                      submission: sub,
                                      task,
                                    });
                                  }
                                }}
                                className="px-3 py-1.5 rounded-xl glass-pill font-semibold text-xs text-accent hover:bg-surfaceSecondary border border-border shrink-0"
                              >
                                Review
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 2026 Activity Heatmap Grid */}
                  <div className="glass-card rounded-3xl p-6 border border-border space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <h2 className="text-base font-bold font-heading text-foreground flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-accent" />
                          <span>2026 Activity Heatmap</span>
                        </h2>
                        <p className="text-xs text-muted mt-0.5">
                          Consistent writing habit tracker across 2026
                        </p>
                      </div>

                      {/* Toggle: Tests vs Study time */}
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

                    {/* Heatmap Grid Container */}
                    <div className="overflow-x-auto pb-2">
                      <div className="min-w-[680px] space-y-1.5">
                        {/* Month Header */}
                        <div className="flex text-[10px] font-semibold text-muted pl-6">
                          {[
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
                          ].map((m, idx) => (
                            <div key={idx} className="w-[54px] text-left truncate">
                              {m.name}
                            </div>
                          ))}
                        </div>

                        {/* Grid with Day of week indicators */}
                        <div className="flex gap-1.5 items-start">
                          <div className="flex flex-col gap-1 text-[9px] font-bold text-muted uppercase tracking-tighter w-4 pt-0.5">
                            <span className="h-3 leading-3">S</span>
                            <span className="h-3 leading-3 opacity-0">M</span>
                            <span className="h-3 leading-3">T</span>
                            <span className="h-3 leading-3 opacity-0">W</span>
                            <span className="h-3 leading-3">T</span>
                            <span className="h-3 leading-3 opacity-0">F</span>
                            <span className="h-3 leading-3">S</span>
                          </div>

                          <div className="flex gap-1">
                            {heatmapWeeks.map((week, wIdx) => (
                              <div key={wIdx} className="flex flex-col gap-1">
                                {week.map((day, dIdx) => {
                                  let colorClass = "invisible";
                                  if (day.count !== -1) {
                                    if (heatmapMetric === "tests") {
                                      if (day.count === 0) colorClass = "bg-surfaceSecondary/60 dark:bg-white/5 border border-border/40";
                                      else if (day.count === 1) colorClass = "bg-[#E31837]/30 border border-[#E31837]/40";
                                      else if (day.count === 2) colorClass = "bg-[#E31837]/60 border border-[#E31837]/70";
                                      else colorClass = "bg-[#E31837] border border-[#BE123C] shadow-sm shadow-[#E31837]/40";
                                    } else {
                                      if (day.minutes === 0) colorClass = "bg-surfaceSecondary/60 dark:bg-white/5 border border-border/40";
                                      else if (day.minutes <= 25) colorClass = "bg-[#E31837]/30 border border-[#E31837]/40";
                                      else if (day.minutes <= 45) colorClass = "bg-[#E31837]/60 border border-[#E31837]/70";
                                      else colorClass = "bg-[#E31837] border border-[#BE123C] shadow-sm shadow-[#E31837]/40";
                                    }
                                  }

                                  return (
                                    <div
                                      key={dIdx}
                                      onMouseEnter={() => {
                                        if (day.date) {
                                          setHoveredHeatmapDay({
                                            date: day.date,
                                            count: day.count,
                                            minutes: day.minutes,
                                          });
                                        }
                                      }}
                                      onMouseLeave={() => setHoveredHeatmapDay(null)}
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
                            {hoveredHeatmapDay ? (
                              <span className="text-foreground">
                                <strong>{hoveredHeatmapDay.date}</strong> &bull;{" "}
                                <span className="text-accent font-semibold">{hoveredHeatmapDay.count} tests</span> ({hoveredHeatmapDay.minutes} mins studied)
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
                  </div>
                </div>

                {/* Right 1 Column: Mini Calendar & Today's Timeline */}
                <div className="space-y-6">
                  {/* "Your Week" 7-Day Bar Chart */}
                  <div className="glass-card rounded-3xl p-5 border border-border space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold font-heading text-sm text-foreground flex items-center gap-2">
                        <Flame className="w-4 h-4 text-accent" />
                        <span>Your Week</span>
                      </h3>
                      <span className="text-[11px] font-semibold text-muted">
                        Last 7 Days
                      </span>
                    </div>

                    {/* 7 Vertical Bars */}
                    <div className="flex items-end justify-between gap-2 pt-4 pb-2 px-1 h-32">
                      {weekDaysData.map((d, idx) => {
                        const maxMins = Math.max(60, ...weekDaysData.map((w) => w.minutes));
                        const heightPct = Math.max(8, Math.min(100, Math.round((d.minutes / maxMins) * 100)));
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                            {/* Duration label */}
                            <span className="text-[9px] font-mono text-muted group-hover:text-foreground font-semibold">
                              {d.minutes > 0 ? `${d.minutes}m` : "—"}
                            </span>

                            {/* Bar */}
                            <div className="w-full bg-surfaceSecondary rounded-t-lg overflow-hidden h-full flex items-end">
                              <div
                                className={`w-full rounded-t-lg transition-all duration-500 ${
                                  d.isToday
                                    ? "bg-[#E31837] shadow-sm shadow-[#E31837]/40"
                                    : d.minutes > 0
                                    ? "bg-[#E31837]/60 hover:bg-[#E31837]"
                                    : "bg-transparent"
                                }`}
                                style={{ height: `${d.minutes > 0 ? heightPct : 0}%` }}
                              />
                            </div>

                            {/* Day label */}
                            <span
                              className={`text-[10px] font-bold ${
                                d.isToday ? "text-accent" : "text-muted"
                              }`}
                            >
                              {d.dayLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted">
                      <span>Weekly Volume:</span>
                      <strong className="text-foreground">
                        {weekDaysData.reduce((acc, d) => acc + d.minutes, 0)} mins practiced
                      </strong>
                    </div>
                  </div>
                  {/* Interactive Mini Calendar Widget */}
                  <div className="glass-card rounded-3xl p-5 border border-border space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold font-heading text-sm text-foreground flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-accent" />
                        <span>
                          {monthName} {calendarYear}
                        </span>
                      </h3>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            setCalendarDate(
                              new Date(calendarYear, calendarMonth - 1, 1)
                            )
                          }
                          aria-label="Previous month"
                          className="p-1 rounded-lg glass-pill hover:bg-surfaceSecondary text-muted hover:text-foreground"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setCalendarDate(
                              new Date(calendarYear, calendarMonth + 1, 1)
                            )
                          }
                          aria-label="Next month"
                          className="p-1 rounded-lg glass-pill hover:bg-surfaceSecondary text-muted hover:text-foreground"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Day names */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted uppercase">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                        <div key={d} className="py-1">
                          {d}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Day Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      {/* Empty slots before first day */}
                      {Array.from({ length: firstDayIndex }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-8" />
                      ))}

                      {/* Days of current month */}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1;
                        const dateKey = `${calendarYear}-${calendarMonth}-${dayNum}`;
                        const isCurrentDay = dateKey === todayStr;
                        const hasCompletedTest = completedDateSet.has(dateKey);

                        return (
                          <div
                            key={`day-${dayNum}`}
                            className={`h-8 rounded-xl flex flex-col items-center justify-center font-medium relative transition-colors ${
                              isCurrentDay
                                ? "bg-[#E31837] text-white font-bold shadow-md shadow-[#E31837]/25"
                                : "hover:bg-surfaceSecondary text-foreground"
                            }`}
                          >
                            <span>{dayNum}</span>
                            {hasCompletedTest && !isCurrentDay && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute bottom-1" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="pt-3 border-t border-border flex items-center justify-between text-[10px] text-muted">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#E31837]" />
                        <span>Today</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Test Completed</span>
                      </span>
                    </div>
                  </div>

                  {/* Today's Timeline Widget */}
                  <div className="glass-card rounded-3xl p-5 border border-border space-y-3">
                    <h3 className="font-bold font-heading text-sm text-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent" />
                      <span>Today's Study Focus</span>
                    </h3>

                    <div className="p-3.5 rounded-2xl bg-surfaceSecondary/60 border border-border text-xs space-y-2">
                      <span className="font-bold text-foreground block">
                        🎯 Recommended Daily Target:
                      </span>
                      <p className="text-muted leading-relaxed text-[11px]">
                        Write 1 Cambridge Task 2 essay (40 mins, 250+ words) and inspect your Band breakdown in {nativeLanguage}.
                      </p>
                      <button
                        onClick={() => {
                          setActiveTab("practice");
                          setPracticeFolder("task_2");
                        }}
                        className="mt-1 px-3 py-1.5 rounded-xl bg-accent text-white font-semibold text-[11px] shadow-sm hover:bg-accent-hover transition-colors"
                      >
                        Browse Task 2 Topics
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------------
              TAB 2: FOLDER-BASED PRACTICE TESTS BROWSER
          ------------------------------------------------------------------- */}
          {activeTab === "practice" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
                    Practice Tests
                  </h1>
                  <p className="text-xs sm:text-sm text-muted mt-0.5">
                    Authentic Cambridge IELTS prompts &bull; Real-time exam simulation under strict lockdown
                  </p>
                </div>

                {/* Search Bar in Practice View */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search practice topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              {/* Folder Navigation Split View */}
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left Folder Side-Panel */}
                <div className="w-full md:w-56 shrink-0 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted px-3 block mb-1">
                    Folders
                  </span>

                  {[
                    { id: "all", label: "All Tasks", count: tasks.length },
                    {
                      id: "task_1",
                      label: "Task 1 (Charts)",
                      count: tasks.filter((t) => t.task_type === "task_1").length,
                    },
                    {
                      id: "task_2",
                      label: "Task 2 (Essays)",
                      count: tasks.filter((t) => t.task_type === "task_2").length,
                    },
                    {
                      id: "completed",
                      label: "Completed",
                      count: completedTaskMap.size,
                    },
                    {
                      id: "favorites",
                      label: "Favorites",
                      count: tasks.filter((t) => favorites.has(t.id)).length,
                    },
                  ].map((folder) => {
                    const isSelected = practiceFolder === folder.id;
                    return (
                      <button
                        key={folder.id}
                        onClick={() => setPracticeFolder(folder.id as any)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-[#E31837] text-white shadow-sm"
                            : "text-muted hover:text-foreground hover:bg-surfaceSecondary"
                        }`}
                      >
                        <span>{folder.label}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isSelected ? "bg-white text-accent" : "bg-surfaceSecondary text-muted"
                          }`}
                        >
                          {folder.count}
                        </span>
                      </button>
                    );
                  })}

                  {/* Category Filter Dropdown */}
                  {categories.length > 0 && (
                    <div className="pt-4 border-t border-border mt-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted px-3 block mb-2">
                        Category Filter
                      </span>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full p-2 rounded-xl glass-input text-xs cursor-pointer bg-surface text-foreground"
                      >
                        <option value="all">All Categories</option>
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Right Cards Grid */}
                <div className="flex-1 min-w-0 space-y-4">
                  {filteredTasks.length === 0 ? (
                    <div className="glass-card rounded-3xl p-12 text-center flex flex-col items-center">
                      <FileText className="w-10 h-10 text-muted mb-3 opacity-60" />
                      <h3 className="text-base font-bold font-heading text-foreground mb-1">
                        No Tasks in this Folder
                      </h3>
                      <p className="text-xs text-muted max-w-sm leading-relaxed">
                        {searchQuery.trim()
                          ? `No practice topics matched "${searchQuery}".`
                          : "No published tasks are currently found in this category or folder."}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredTasks.map((task) => {
                        const isCompleted = completedTaskMap.has(task.id);
                        const failedCheat = failedCheatTaskMap.has(task.id);
                        const pastSubmission = completedTaskMap.get(task.id);
                        const isFav = favorites.has(task.id);

                        return (
                          <div
                            key={task.id}
                            className="glass-card rounded-3xl p-5 border border-border/80 flex flex-col justify-between transition-all hover:border-accent/40 shadow-sm group"
                          >
                            <div>
                              {/* Top Badges & Favorite Button */}
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                      task.task_type === "task_1"
                                        ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                        : "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                                    }`}
                                  >
                                    {task.task_type === "task_1" ? "Task 1: Charts" : "Task 2: Essay"}
                                  </span>

                                  <span className="text-[11px] text-muted font-medium truncate max-w-[120px]">
                                    {task.topic_category}
                                  </span>
                                </div>

                                <button
                                  onClick={(e) => toggleFavorite(task.id, e)}
                                  aria-label="Toggle favorite"
                                  className="p-1.5 rounded-lg glass-pill text-muted hover:text-accent transition-colors"
                                >
                                  <Star
                                    className={`w-3.5 h-3.5 ${
                                      isFav ? "fill-amber-400 text-amber-400" : ""
                                    }`}
                                  />
                                </button>
                              </div>

                              <h3 className="text-sm font-bold font-heading text-foreground mb-2 line-clamp-2">
                                {task.title}
                              </h3>

                              <p className="text-xs text-muted leading-relaxed line-clamp-3 mb-4">
                                {task.prompt_text}
                              </p>
                            </div>

                            {/* Card Footer */}
                            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 text-muted text-[11px]">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-accent" />
                                  {task.task_type === "task_1" ? "20m" : "40m"}
                                </span>
                                <span>&bull;</span>
                                <span>{task.task_type === "task_1" ? "≥ 150w" : "≥ 250w"}</span>
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
                                  className="px-3 py-1.5 rounded-xl glass-pill font-semibold text-xs text-accent hover:bg-surfaceSecondary border border-border transition-colors flex items-center gap-1"
                                >
                                  <span>Band {pastSubmission?.overall_band?.toFixed(1) || "Done"}</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              ) : (
                                <Link href={`/practice/${task.id}`}>
                                  <motion.button
                                    {...tactileButton}
                                    disabled={isLocked}
                                    className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors ${
                                      isLocked
                                        ? "bg-muted/40 text-muted cursor-not-allowed"
                                        : "bg-[#E31837] text-white shadow-md shadow-[#E31837]/25 hover:bg-[#BE123C]"
                                    }`}
                                  >
                                    <span>{failedCheat ? "Retry Exam" : "Start Exam"}</span>
                                    <ArrowRight className="w-3 h-3" />
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
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------------
              TAB 3: CALENDAR & PLANNER
          ------------------------------------------------------------------- */}
          {activeTab === "calendar" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
                    Study Calendar &amp; Daily Reflection
                  </h1>
                  <p className="text-xs sm:text-sm text-muted mt-0.5">
                    Schedule practice exams, set daily revision targets, and write daily reflection journals.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewEventDate(selectedEventDate);
                      setIsNewEventModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#E31837] text-white text-xs font-bold shadow-md shadow-[#E31837]/25 hover:bg-[#BE123C] flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Schedule Event</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Big Calendar Card */}
                <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-border space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold font-heading text-foreground flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-accent" />
                      <span>
                        {monthName} {calendarYear}
                      </span>
                    </h2>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          const prev = new Date(calendarYear, calendarMonth - 1, 1);
                          setCalendarDate(prev);
                          loadCalendarEvents(prev.getFullYear(), prev.getMonth() + 1);
                        }}
                        className="p-1.5 rounded-xl glass-pill hover:bg-surfaceSecondary text-muted hover:text-foreground"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const next = new Date(calendarYear, calendarMonth + 1, 1);
                          setCalendarDate(next);
                          loadCalendarEvents(next.getFullYear(), next.getMonth() + 1);
                        }}
                        className="p-1.5 rounded-xl glass-pill hover:bg-surfaceSecondary text-muted hover:text-foreground"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Day names */}
                  <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-muted uppercase">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <div key={d} className="py-2">
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2 text-center text-xs">
                    {Array.from({ length: firstDayIndex }).map((_, i) => (
                      <div key={`empty-big-${i}`} className="h-14" />
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const dayNum = i + 1;
                      const dateKey = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                      const isCurrentDay = dateKey === new Date().toISOString().split("T")[0];
                      const isSelected = dateKey === selectedEventDate;
                      const hasCompletedTest = completedDateSet.has(`${calendarYear}-${calendarMonth}-${dayNum}`);
                      const dayEvents = calendarEvents.filter((ev) => ev.event_date.startsWith(dateKey));

                      return (
                        <button
                          key={`big-day-${dayNum}`}
                          type="button"
                          onClick={() => {
                            setSelectedEventDate(dateKey);
                            loadDailyReflection(dateKey);
                          }}
                          className={`h-14 rounded-2xl flex flex-col items-center justify-between p-1.5 font-medium relative border transition-all ${
                            isSelected
                              ? "border-[#E31837] bg-accent/10 shadow-sm shadow-[#E31837]/20"
                              : isCurrentDay
                              ? "bg-surfaceSecondary border-accent/40"
                              : "glass-panel border-border/70 text-foreground hover:border-accent/40"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span
                              className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                                isCurrentDay
                                  ? "bg-[#E31837] text-white"
                                  : "text-foreground"
                              }`}
                            >
                              {dayNum}
                            </span>
                            {hasCompletedTest && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Completed test on this day" />
                            )}
                          </div>

                          {/* Event Indicators */}
                          <div className="w-full flex items-center justify-center gap-1 overflow-hidden">
                            {dayEvents.slice(0, 3).map((ev, eIdx) => (
                              <span
                                key={eIdx}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  ev.category === "Exam Date"
                                    ? "bg-red-500"
                                    : ev.category === "Goals"
                                    ? "bg-purple-500"
                                    : ev.category === "To-do"
                                    ? "bg-amber-500"
                                    : "bg-blue-500"
                                }`}
                              />
                            ))}
                            {dayEvents.length > 3 && (
                              <span className="text-[9px] text-muted font-bold font-mono">
                                +{dayEvents.length - 3}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side: Selected Date Schedule & Daily Reflection Journal */}
                <div className="space-y-6">
                  {/* Selected Date Schedule */}
                  <div className="glass-card rounded-3xl p-5 border border-border space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-accent block">
                          Schedule For
                        </span>
                        <h3 className="font-bold font-heading text-sm text-foreground">
                          {new Date(selectedEventDate + "T00:00:00").toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setNewEventDate(selectedEventDate);
                          setIsNewEventModalOpen(true);
                        }}
                        className="p-1.5 rounded-xl glass-pill text-accent hover:bg-accent/10 transition-colors"
                        title="Add event on this date"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Events List */}
                    <div className="space-y-2 text-xs">
                      {calendarEvents.filter((ev) => ev.event_date.startsWith(selectedEventDate)).length === 0 ? (
                        <div className="p-4 rounded-2xl bg-surfaceSecondary/40 border border-border text-center text-muted">
                          <p>No study tasks scheduled for this day.</p>
                          <button
                            type="button"
                            onClick={() => {
                              setNewEventDate(selectedEventDate);
                              setIsNewEventModalOpen(true);
                            }}
                            className="mt-2 text-accent font-semibold hover:underline inline-block"
                          >
                            + Add a study goal or exam
                          </button>
                        </div>
                      ) : (
                        calendarEvents
                          .filter((ev) => ev.event_date.startsWith(selectedEventDate))
                          .map((ev) => (
                            <div
                              key={ev.id}
                              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                                ev.is_completed
                                  ? "bg-surfaceSecondary/30 border-border opacity-60"
                                  : "glass-card border-border hover:border-accent/30"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => handleToggleEventCompleted(ev.id, ev.is_completed)}
                                  className="text-muted hover:text-accent shrink-0"
                                >
                                  {ev.is_completed ? (
                                    <CheckSquare className="w-4 h-4 text-emerald-500" />
                                  ) : (
                                    <Square className="w-4 h-4" />
                                  )}
                                </button>
                                <div className="min-w-0">
                                  <span
                                    className={`font-semibold block truncate ${
                                      ev.is_completed ? "line-through text-muted" : "text-foreground"
                                    }`}
                                  >
                                    {ev.title}
                                  </span>
                                  <span className="text-[10px] text-muted flex items-center gap-1.5">
                                    <span
                                      className={`px-1.5 py-0.2 rounded font-medium ${
                                        ev.category === "Exam Date"
                                          ? "text-red-500 bg-red-500/10"
                                          : ev.category === "Goals"
                                          ? "text-purple-500 bg-purple-500/10"
                                          : "text-blue-500 bg-blue-500/10"
                                      }`}
                                    >
                                      {ev.category}
                                    </span>
                                    {ev.start_time && (
                                      <span>
                                        {ev.start_time} {ev.end_time ? `- ${ev.end_time}` : ""}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteCalendarEvent(ev.id)}
                                className="p-1 text-muted hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  {/* Daily Reflection & Goals Journal */}
                  <div className="glass-card rounded-3xl p-5 border border-border space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold font-heading text-sm text-foreground flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-accent" />
                        <span>Daily Reflection &amp; Goals</span>
                      </h3>
                      {reflectionSavedToast && (
                        <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Saved!</span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-muted font-medium mb-1">
                          Today&apos;s Target / Goal:
                        </label>
                        <input
                          type="text"
                          value={dailyGoal}
                          onChange={(e) => setDailyGoal(e.target.value)}
                          placeholder="e.g. Master Task 1 overview paragraph & 15 collocations"
                          className="w-full px-3 py-2 rounded-xl border border-border bg-surfaceSecondary text-foreground focus:outline-none focus:border-accent"
                        />
                      </div>

                      <div>
                        <label className="block text-muted font-medium mb-1">
                          Evening Reflection &amp; Insights:
                        </label>
                        <textarea
                          rows={3}
                          value={dailyReflectionText}
                          onChange={(e) => setDailyReflectionText(e.target.value)}
                          placeholder="What went well today? What sentence structures need improvement tomorrow?"
                          className="w-full px-3 py-2 rounded-xl border border-border bg-surfaceSecondary text-foreground focus:outline-none focus:border-accent resize-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveDailyReflection}
                        disabled={isSavingReflection}
                        className="w-full py-2 rounded-xl bg-accent text-white font-semibold text-xs shadow-sm hover:bg-accent-hover transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isSavingReflection ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Save Daily Reflection</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* New Event Modal */}
              <AnimatePresence>
                {isNewEventModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      transition={iosSpring}
                      className="glass-card w-full max-w-md rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden bg-surface/95 backdrop-blur-xl p-6 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-5 h-5 text-accent" />
                          <h2 className="text-base font-bold font-heading text-foreground">
                            Schedule Study Event
                          </h2>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsNewEventModalOpen(false)}
                          className="p-1 rounded-lg text-muted hover:text-foreground"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handleCreateCalendarEvent} className="space-y-3 text-xs">
                        <div>
                          <label className="block font-semibold text-foreground mb-1">
                            Event Title *
                          </label>
                          <input
                            type="text"
                            required
                            value={newEventTitle}
                            onChange={(e) => setNewEventTitle(e.target.value)}
                            placeholder="e.g. Task 2 Timed Simulation or Cambridge Book 18"
                            className="w-full px-3 py-2 rounded-xl border border-border bg-surfaceSecondary text-foreground focus:outline-none focus:border-accent"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-foreground mb-1">
                              Category
                            </label>
                            <select
                              value={newEventCategory}
                              onChange={(e) => setNewEventCategory(e.target.value as any)}
                              className="w-full px-3 py-2 rounded-xl border border-border bg-surfaceSecondary text-foreground focus:outline-none focus:border-accent"
                            >
                              <option value="Study">Study Session</option>
                              <option value="Exam Date">Official Exam Date</option>
                              <option value="To-do">To-do</option>
                              <option value="Goals">Target Goal</option>
                            </select>
                          </div>

                          <div>
                            <label className="block font-semibold text-foreground mb-1">
                              Date
                            </label>
                            <input
                              type="date"
                              required
                              value={newEventDate}
                              onChange={(e) => setNewEventDate(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-border bg-surfaceSecondary text-foreground focus:outline-none focus:border-accent"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-foreground mb-1">
                              Start Time (Optional)
                            </label>
                            <input
                              type="time"
                              value={newEventStartTime}
                              onChange={(e) => setNewEventStartTime(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-border bg-surfaceSecondary text-foreground focus:outline-none focus:border-accent"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-foreground mb-1">
                              End Time (Optional)
                            </label>
                            <input
                              type="time"
                              value={newEventEndTime}
                              onChange={(e) => setNewEventEndTime(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-border bg-surfaceSecondary text-foreground focus:outline-none focus:border-accent"
                            />
                          </div>
                        </div>

                        <div className="pt-3 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setIsNewEventModalOpen(false)}
                            className="px-4 py-2 rounded-xl text-muted hover:text-foreground font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isCreatingEvent}
                            className="px-5 py-2 rounded-xl bg-[#E31837] text-white font-bold shadow-md shadow-[#E31837]/25 hover:bg-[#BE123C] flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {isCreatingEvent ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                            <span>Save Event</span>
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* -------------------------------------------------------------------
              TAB 4: FREE ASSETS HUB (Full Preserved Feature Set)
          ------------------------------------------------------------------- */}
          {activeTab === "assets" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
                  Free Assets &amp; Study Library
                </h1>
                <p className="text-xs sm:text-sm text-muted mt-0.5">
                  Cambridge Band 9 blueprints, downloadable study materials, and personalized bilingual takeaways.
                </p>
              </div>

              {/* 5 iOS Segmented Sub-Tabs */}
              <div className="p-1 rounded-2xl glass-pill flex flex-wrap items-center gap-1 border border-border">
                {[
                  { id: "files", label: "Files & PDFs", icon: FolderDown },
                  { id: "vocabulary", label: "Vocabulary & Spaced Review", icon: BookOpen },
                  { id: "articles", label: "Study Articles & Guides", icon: BookMarked },
                  { id: "grammar", label: "Grammar", icon: Layers },
                  { id: "tricks", label: "Exam Tricks", icon: Lightbulb },
                ].map((st) => {
                  const Icon = st.icon;
                  const isSelected = assetSubTab === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => setAssetSubTab(st.id as any)}
                      className={`py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? "bg-[#E31837] text-white shadow-sm"
                          : "text-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* SUB-TAB 1: FILES & PDFS */}
              {assetSubTab === "files" && (
                <div className="space-y-4">
                  {filteredFiles.length === 0 ? (
                    <div className="glass-card rounded-3xl p-10 text-center border border-border flex flex-col items-center justify-center">
                      <FolderDown className="w-8 h-8 text-muted mb-2 opacity-60" />
                      <h3 className="font-bold font-heading text-sm text-foreground">
                        No study files published yet
                      </h3>
                      <p className="text-xs text-muted max-w-sm mt-1">
                        Check back soon — our educators and examiners publish Cambridge cheat sheets and chart guides regularly.
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
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <span
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                  file.file_type.includes("pdf")
                                    ? "bg-[#E31837]/10 text-[#E31837] border border-[#E31837]/20"
                                    : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                }`}
                              >
                                {file.file_type.includes("pdf") ? "PDF" : "Image"}
                              </span>
                              <span className="text-[11px] text-muted truncate">
                                {file.category}
                              </span>
                            </div>

                            <h3 className="font-bold font-heading text-sm text-foreground group-hover:text-accent transition-colors line-clamp-1">
                              {file.title}
                            </h3>
                            <p className="text-xs text-muted mt-1.5 line-clamp-2 leading-relaxed">
                              {file.description || "Official IELTS preparation resource published by IELTSPen Ai."}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                            <span className="text-[11px] text-muted font-mono">
                              {formatFileSize(file.file_size)}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setViewerFile(file)}
                                className="px-2.5 py-1 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent font-semibold text-xs border border-accent/20 transition-all flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View</span>
                              </button>
                              <a
                                href={`${file.file_url}?download=1`}
                                download={file.file_name}
                                className="px-2.5 py-1 rounded-lg bg-surfaceSecondary hover:bg-border text-foreground text-xs font-semibold border border-border transition-all flex items-center gap-1"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Save</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-TAB 2: VOCABULARY & SPACED REVIEW HUB */}
              {assetSubTab === "vocabulary" && (
                <div className="space-y-6">
                  {/* Spaced Repetition Mastery Banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="glass-card rounded-2xl p-4 border border-border">
                      <span className="text-[11px] font-medium text-muted block">Saved Lexicon</span>
                      <strong className="text-xl font-extrabold font-heading text-foreground mt-0.5 block">
                        {savedVocabList.length} Words
                      </strong>
                    </div>

                    <div className="glass-card rounded-2xl p-4 border border-border">
                      <span className="text-[11px] font-medium text-muted block">Due for Review</span>
                      <strong className="text-xl font-extrabold font-heading text-red-500 mt-0.5 block">
                        {
                          savedVocabList.filter(
                            (v) => !v.next_review_at || new Date(v.next_review_at) <= new Date()
                          ).length
                        }
                      </strong>
                    </div>

                    <div className="glass-card rounded-2xl p-4 border border-border">
                      <span className="text-[11px] font-medium text-muted block">Mastered (Level 4+)</span>
                      <strong className="text-xl font-extrabold font-heading text-emerald-500 mt-0.5 block">
                        {savedVocabList.filter((v) => (v.mastery_level || 1) >= 4).length}
                      </strong>
                    </div>

                    <div className="glass-card rounded-2xl p-4 border border-border">
                      <span className="text-[11px] font-medium text-muted block">Native Explanations</span>
                      <strong className="text-xl font-extrabold font-heading text-accent mt-0.5 block truncate">
                        {nativeLanguage}
                      </strong>
                    </div>
                  </div>

                  {/* Actions & Topic Filters */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Topic Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                      {[
                        "all",
                        "Environment & Climate",
                        "Technology & AI",
                        "Education",
                        "Health",
                        "Work & Economy",
                        "Writing Task 1 — Trends",
                        "Linking & Academic Phrases",
                        "General Academic",
                      ].map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => setVocabCategoryFilter(topic)}
                          className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                            vocabCategoryFilter === topic
                              ? "bg-[#E31837] text-white shadow-sm"
                              : "glass-pill text-muted hover:text-foreground border border-border"
                          }`}
                        >
                          {topic === "all" ? "All Topics" : topic}
                        </button>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsAddWordModalOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl glass-pill text-xs font-semibold text-accent border border-accent/20 hover:bg-accent/10 flex items-center gap-1.5 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Word</span>
                      </button>

                      {savedVocabList.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsFlashcardMode(!isFlashcardMode);
                            setFlashcardIndex(0);
                            setIsCardFlipped(false);
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isFlashcardMode
                              ? "bg-foreground text-background"
                              : "bg-[#E31837] text-white shadow-md shadow-[#E31837]/25 hover:bg-[#BE123C]"
                          }`}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>{isFlashcardMode ? "Exit Review" : "Practice Flashcards"}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* FLASHCARD REVIEW MODE */}
                  {isFlashcardMode && savedVocabList.length > 0 && (
                    <div className="glass-card rounded-3xl p-8 border border-accent/30 flex flex-col items-center justify-center max-w-xl mx-auto space-y-6">
                      <div className="flex items-center justify-between w-full text-xs text-muted">
                        <span>
                          Card <strong>{flashcardIndex + 1}</strong> of <strong>{savedVocabList.length}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold text-[10px] uppercase">
                          {savedVocabList[flashcardIndex].topic_category || "General"}
                        </span>
                      </div>

                      {/* 3D Flip Flashcard */}
                      <div
                        onClick={() => setIsCardFlipped(!isCardFlipped)}
                        className="w-full min-h-[220px] rounded-3xl p-8 cursor-pointer flex flex-col items-center justify-center text-center transition-all bg-surfaceSecondary/60 hover:bg-surfaceSecondary border border-border shadow-lg relative group select-none"
                      >
                        {!isCardFlipped ? (
                          <div className="space-y-3">
                            <span className="text-[10px] uppercase tracking-widest text-muted font-bold block">
                              Academic Term (English)
                            </span>
                            <h2 className="text-3xl font-extrabold font-heading text-foreground group-hover:text-accent transition-colors">
                              {savedVocabList[flashcardIndex].word}
                            </h2>
                            <span className="text-xs text-muted block mt-2">
                              Tap to flip for meaning &amp; {nativeLanguage} translation
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-4 max-w-md">
                            <div>
                              <span className="text-[10px] uppercase tracking-wider text-muted font-bold block">
                                Definition
                              </span>
                              <p className="text-sm font-semibold text-foreground mt-1">
                                {savedVocabList[flashcardIndex].meaning_en}
                              </p>
                            </div>

                            {savedVocabList[flashcardIndex].meaning_native && (
                              <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20 text-xs font-medium text-accent">
                                💡 <strong>{nativeLanguage}:</strong> {savedVocabList[flashcardIndex].meaning_native}
                              </div>
                            )}

                            {savedVocabList[flashcardIndex].example_sentence && (
                              <div className="text-xs text-muted italic">
                                &ldquo;{savedVocabList[flashcardIndex].example_sentence}&rdquo;
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Spaced Repetition Rating Buttons */}
                      <div className="w-full space-y-2">
                        <span className="text-[11px] text-muted text-center block">
                          How well do you know this word? (Adjusts next review interval)
                        </span>
                        <div className="grid grid-cols-4 gap-2">
                          <button
                            type="button"
                            disabled={isReviewingCard}
                            onClick={() => handleReviewCard("again")}
                            className="py-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-bold text-xs transition-colors"
                          >
                            <span className="block font-heading">Again</span>
                            <span className="text-[10px] font-normal opacity-80">1 hr</span>
                          </button>
                          <button
                            type="button"
                            disabled={isReviewingCard}
                            onClick={() => handleReviewCard("hard")}
                            className="py-2.5 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white font-bold text-xs transition-colors"
                          >
                            <span className="block font-heading">Hard</span>
                            <span className="text-[10px] font-normal opacity-80">1 day</span>
                          </button>
                          <button
                            type="button"
                            disabled={isReviewingCard}
                            onClick={() => handleReviewCard("good")}
                            className="py-2.5 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white font-bold text-xs transition-colors"
                          >
                            <span className="block font-heading">Good</span>
                            <span className="text-[10px] font-normal opacity-80">3 days</span>
                          </button>
                          <button
                            type="button"
                            disabled={isReviewingCard}
                            onClick={() => handleReviewCard("easy")}
                            className="py-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white font-bold text-xs transition-colors"
                          >
                            <span className="block font-heading">Easy</span>
                            <span className="text-[10px] font-normal opacity-80">7 days</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SAVED WORDS GRID */}
                  {(!isFlashcardMode || savedVocabList.length === 0) && (
                    <div className="space-y-4">
                      {savedVocabList.length === 0 ? (
                        <div className="glass-card rounded-3xl p-10 text-center border border-border flex flex-col items-center justify-center">
                          <BookOpen className="w-8 h-8 text-muted mb-2 opacity-60" />
                          <h3 className="font-bold font-heading text-sm text-foreground">
                            No saved vocabulary yet
                          </h3>
                          <p className="text-xs text-muted max-w-sm mt-1">
                            Save new IELTS academic words or harvest them while reading study articles and completing practice tests.
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsAddWordModalOpen(true)}
                            className="mt-4 px-4 py-2 rounded-xl bg-accent text-white font-semibold text-xs shadow-sm hover:bg-accent-hover transition-colors"
                          >
                            + Add Your First Word
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {savedVocabList
                            .filter(
                              (v) =>
                                vocabCategoryFilter === "all" ||
                                v.topic_category === vocabCategoryFilter
                            )
                            .map((item) => (
                              <div
                                key={item.id}
                                className="glass-card rounded-2xl p-5 border border-border hover:border-accent/30 transition-all flex flex-col justify-between space-y-3 group text-xs"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-extrabold font-heading text-base text-foreground group-hover:text-accent transition-colors">
                                      {item.word}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent/10 text-accent uppercase">
                                        Lvl {item.mastery_level || 1}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteWord(item.id)}
                                        className="p-1 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                        title="Delete word"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  <span className="text-[10px] text-muted uppercase font-semibold block">
                                    {item.topic_category || "General Academic"}
                                  </span>

                                  <p className="text-muted leading-relaxed font-medium">
                                    {item.meaning_en}
                                  </p>

                                  {item.meaning_native && (
                                    <div className="p-2 rounded-xl bg-accent/5 border border-accent/15 text-[11px] text-accent">
                                      💡 <strong>{nativeLanguage}:</strong> {item.meaning_native}
                                    </div>
                                  )}

                                  {item.example_sentence && (
                                    <p className="text-[11px] text-muted italic">
                                      &ldquo;{item.example_sentence}&rdquo;
                                    </p>
                                  )}
                                </div>

                                <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted">
                                  <span>
                                    Next review:{" "}
                                    {item.next_review_at
                                      ? new Date(item.next_review_at).toLocaleDateString()
                                      : "Ready now"}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Also show Auto-Harvested Vocabulary from Completed Tests if available */}
                      {studyVocabulary.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-border space-y-3">
                          <h3 className="font-bold font-heading text-sm text-foreground flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-accent" />
                            <span>Auto-Harvested Test Takeaways ({studyVocabulary.length})</span>
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {studyVocabulary.map((item) => (
                              <div
                                key={item.id}
                                className="glass-card rounded-2xl p-4 border border-border text-xs space-y-1.5"
                              >
                                <div className="flex items-center justify-between">
                                  <strong className="text-foreground">{item.title_en}</strong>
                                  <span className="text-[10px] text-muted">{item.category}</span>
                                </div>
                                <p className="text-muted">{item.content_en}</p>
                                {(item.display_explanation || item.explanation_native) && (
                                  <div className="p-2 rounded-lg bg-accent/5 text-[11px] text-accent">
                                    💡 {item.display_explanation || item.explanation_native}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add Word Modal */}
                  <AnimatePresence>
                    {isAddWordModalOpen && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 20 }}
                          transition={iosSpring}
                          className="glass-card w-full max-w-md rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden bg-surface/95 backdrop-blur-xl p-6 space-y-4"
                        >
                          <div className="flex items-center justify-between border-b border-border pb-3">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-accent" />
                              <h2 className="text-base font-bold font-heading text-foreground">
                                Add to Vocabulary Hub
                              </h2>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsAddWordModalOpen(false)}
                              className="p-1 rounded-lg text-muted hover:text-foreground"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <form onSubmit={handleSaveManualWord} className="space-y-3 text-xs">
                            <div>
                              <label className="block font-semibold text-foreground mb-1">
                                Academic Term / Word *
                              </label>
                              <input
                                type="text"
                                required
                                value={newWord}
                                onChange={(e) => setNewWord(e.target.value)}
                                placeholder="e.g. Ubiquitous, Proliferate, Deteriorate"
                                className="w-full px-3 py-2 rounded-xl border border-border bg-surfaceSecondary text-foreground focus:outline-none focus:border-accent"
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-foreground mb-1">
                                Topic Category
                              </label>
                              <select
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-border bg-surfaceSecondary text-foreground focus:outline-none focus:border-accent"
                              >
                                <option value="General Academic">General Academic</option>
                                <option value="Environment & Climate">Environment & Climate</option>
                                <option value="Technology & AI">Technology & AI</option>
                                <option value="Education">Education</option>
                                <option value="Health">Health</option>
                                <option value="Work & Economy">Work & Economy</option>
                                <option value="Writing Task 1 — Trends">Writing Task 1 — Trends</option>
                                <option value="Linking & Academic Phrases">Linking & Academic Phrases</option>
                              </select>
                            </div>

                            <div>
                              <label className="block font-semibold text-foreground mb-1">
                                English Meaning *
                              </label>
                              <input
                                type="text"
                                required
                                value={newMeaningEn}
                                onChange={(e) => setNewMeaningEn(e.target.value)}
                                placeholder="e.g. Present, appearing, or found everywhere."
                                className="w-full px-3 py-2 rounded-xl border border-border bg-surfaceSecondary text-foreground focus:outline-none focus:border-accent"
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-foreground mb-1">
                                Native Meaning ({nativeLanguage})
                              </label>
                              <input
                                type="text"
                                value={newMeaningNative}
                                onChange={(e) => setNewMeaningNative(e.target.value)}
                                placeholder={`Translation in ${nativeLanguage}`}
                                className="w-full px-3 py-2 rounded-xl border border-border bg-surfaceSecondary text-foreground focus:outline-none focus:border-accent"
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-foreground mb-1">
                                Example Sentence
                              </label>
                              <textarea
                                rows={2}
                                value={newExample}
                                onChange={(e) => setNewExample(e.target.value)}
                                placeholder="e.g. Mobile connectivity has become ubiquitous across contemporary urban societies."
                                className="w-full px-3 py-2 rounded-xl border border-border bg-surfaceSecondary text-foreground focus:outline-none focus:border-accent resize-none"
                              />
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setIsAddWordModalOpen(false)}
                                className="px-4 py-2 rounded-xl text-muted hover:text-foreground font-medium"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={isSavingManualWord}
                                className="px-5 py-2 rounded-xl bg-[#E31837] text-white font-bold shadow-md shadow-[#E31837]/25 hover:bg-[#BE123C] flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {isSavingManualWord ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Plus className="w-4 h-4" />
                                )}
                                <span>Save Word</span>
                              </button>
                            </div>
                          </form>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* SUB-TAB: STUDY ARTICLES & GUIDES */}
              {assetSubTab === "articles" && (
                <div className="space-y-4">
                  {studentArticles.length === 0 ? (
                    <div className="glass-card rounded-3xl p-10 text-center border border-border flex flex-col items-center justify-center">
                      <BookMarked className="w-8 h-8 text-muted mb-2 opacity-60" />
                      <h3 className="font-bold font-heading text-sm text-foreground">
                        No Study Articles Published Yet
                      </h3>
                      <p className="text-xs text-muted max-w-sm mt-1">
                        Our examiners regularly publish Band 9 blueprints and cohesion breakdowns. Check back soon.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {studentArticles.map((art) => (
                        <div
                          key={art.id}
                          className="glass-card rounded-3xl p-5 border border-border hover:border-accent/40 transition-all flex flex-col justify-between group shadow-sm"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent/10 text-accent uppercase tracking-wider">
                                {art.category}
                              </span>
                              <span className="text-[11px] text-muted flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{art.read_time_minutes} min read</span>
                              </span>
                            </div>

                            <h3 className="font-bold font-heading text-sm text-foreground group-hover:text-accent transition-colors line-clamp-2">
                              {art.title}
                            </h3>

                            <p className="text-xs text-muted line-clamp-3 leading-relaxed">
                              {art.content_md.slice(0, 160)}...
                            </p>
                          </div>

                          <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                            <span className="text-[11px] text-muted">
                              By {art.author || "MK.Studio Academic"}
                            </span>

                            <button
                              type="button"
                              onClick={() => setReadingArticle(art)}
                              className="px-3 py-1.5 rounded-xl bg-accent text-white font-semibold text-xs shadow-sm hover:bg-accent-hover transition-colors flex items-center gap-1"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Read &bull; One-Click Learn</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Interactive Article Reading Modal */}
                  <AnimatePresence>
                    {readingArticle && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 20 }}
                          transition={iosSpring}
                          className="glass-card w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden bg-surface/95 backdrop-blur-xl"
                        >
                          {/* Modal Header */}
                          <div className="p-5 border-b border-border flex items-center justify-between shrink-0">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent/10 text-accent uppercase">
                                  {readingArticle.category}
                                </span>
                                <span className="text-[11px] text-muted flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{readingArticle.read_time_minutes} min read</span>
                                </span>
                              </div>
                              <h2 className="text-base sm:text-lg font-bold font-heading text-foreground">
                                {readingArticle.title}
                              </h2>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setReadingArticle(null);
                                setSelectedWordLookup(null);
                                setTooltipPos(null);
                              }}
                              className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-surfaceSecondary"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Instructions Banner */}
                          <div className="px-5 py-2.5 bg-accent/5 border-b border-accent/15 text-[11px] text-accent flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 shrink-0" />
                            <span>
                              <strong>Interactive Reader:</strong> Click any English word to view Cambridge definition, {nativeLanguage} translation, and save it to your vocabulary hub!
                            </span>
                          </div>

                          {/* Article Body with Clickable Words */}
                          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans">
                            {readingArticle.content_md.split("\n\n").map((para, pIdx) => (
                              <p key={pIdx}>
                                {para.split(/(\s+)/).map((segment, sIdx) => {
                                  const isWord = /^[a-zA-Z]+[a-zA-Z-]*[a-zA-Z]*$/.test(
                                    segment.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, "")
                                  );

                                  if (!isWord || segment.trim().length === 0) {
                                    return <span key={sIdx}>{segment}</span>;
                                  }

                                  return (
                                    <span
                                      key={sIdx}
                                      onClick={(e) => handleWordClickInArticle(segment, para, e)}
                                      className="cursor-pointer hover:bg-accent/20 hover:text-accent rounded px-0.5 transition-colors underline decoration-dotted decoration-muted hover:decoration-accent"
                                      title="Click to lookup definition & save"
                                    >
                                      {segment}
                                    </span>
                                  );
                                })}
                              </p>
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>

                  {/* Floating Word Lookup Glass Tooltip */}
                  {tooltipPos && (isLookingUpWord || selectedWordLookup) && (
                    <div
                      style={{
                        position: "fixed",
                        left: Math.min(window.innerWidth - 320, Math.max(20, tooltipPos.x - 120)),
                        top: Math.min(window.innerHeight - 200, tooltipPos.y),
                      }}
                      className="z-[60] w-80 glass-card rounded-2xl p-4 border border-accent/40 shadow-2xl bg-surface/98 backdrop-blur-2xl text-xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold font-heading text-sm text-foreground">
                          {selectedWordLookup?.word || "Looking up..."}
                        </span>
                        {selectedWordLookup?.part_of_speech && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent/10 text-accent italic">
                            {selectedWordLookup.part_of_speech}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setTooltipPos(null)}
                          className="p-1 rounded text-muted hover:text-foreground"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {isLookingUpWord ? (
                        <div className="py-4 text-center flex items-center justify-center gap-2 text-muted">
                          <Loader2 className="w-4 h-4 animate-spin text-accent" />
                          <span>Consulting AI Lexicon...</span>
                        </div>
                      ) : selectedWordLookup ? (
                        <div className="space-y-2">
                          <p className="text-muted leading-relaxed">
                            {selectedWordLookup.definition_en}
                          </p>

                          {selectedWordLookup.definition_native && (
                            <div className="p-2 rounded-xl bg-accent/10 border border-accent/20 text-[11px] text-accent">
                              💡 <strong>{nativeLanguage}:</strong> {selectedWordLookup.definition_native}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={handleSaveWordFromLookup}
                            disabled={isSavingWordFromArticle || wordSavedSuccess === selectedWordLookup.word}
                            className="w-full py-2 rounded-xl bg-[#E31837] text-white font-bold text-xs shadow-sm hover:bg-[#BE123C] flex items-center justify-center gap-1.5 transition-all disabled:opacity-60"
                          >
                            {wordSavedSuccess === selectedWordLookup.word ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Saved to Vocabulary!</span>
                              </>
                            ) : isSavingWordFromArticle ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ Save to Vocabulary Hub</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-TAB 3: GRAMMAR */}
              {assetSubTab === "grammar" && (
                <div className="space-y-4">
                  {studyGrammar.length === 0 ? (
                    <div className="glass-card rounded-3xl p-10 text-center border border-border flex flex-col items-center justify-center">
                      <Layers className="w-8 h-8 text-muted mb-2 opacity-60" />
                      <h3 className="font-bold font-heading text-sm text-foreground">
                        No grammar takeaways unlocked yet
                      </h3>
                      <p className="text-xs text-muted max-w-sm mt-1">
                        Write essay submissions to generate targeted grammar advice.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {studyGrammar.map((item) => (
                        <div
                          key={item.id}
                          className="glass-card rounded-2xl p-5 border border-border hover:border-accent/30 transition-all space-y-2 text-xs"
                        >
                          <span className="font-extrabold font-heading text-base text-foreground block">
                            {item.title_en}
                          </span>
                          <p className="text-muted leading-relaxed">{item.content_en}</p>
                          {(item.display_explanation || item.explanation_native) && (
                            <div className="p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/15 text-[11px] text-purple-600 dark:text-purple-400">
                              💡 <strong>{nativeLanguage}:</strong> {item.display_explanation || item.explanation_native}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-TAB 4: EXAM TRICKS */}
              {assetSubTab === "tricks" && (
                <div className="space-y-4">
                  {studyTricks.length === 0 ? (
                    <div className="glass-card rounded-3xl p-10 text-center border border-border flex flex-col items-center justify-center">
                      <Lightbulb className="w-8 h-8 text-muted mb-2 opacity-60" />
                      <h3 className="font-bold font-heading text-sm text-foreground">
                        No exam tricks unlocked yet
                      </h3>
                      <p className="text-xs text-muted max-w-sm mt-1">
                        Complete simulations to reveal Cambridge examiner secrets.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {studyTricks.map((item) => (
                        <div
                          key={item.id}
                          className="glass-card rounded-2xl p-5 border border-border hover:border-accent/30 transition-all space-y-2 text-xs"
                        >
                          <span className="font-extrabold font-heading text-base text-foreground block">
                            {item.title_en}
                          </span>
                          <p className="text-muted leading-relaxed">{item.content_en}</p>
                          {(item.display_explanation || item.explanation_native) && (
                            <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15 text-[11px] text-amber-600 dark:text-amber-400">
                              💡 <strong>{nativeLanguage}:</strong> {item.display_explanation || item.explanation_native}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* -------------------------------------------------------------------
              TAB 5: ACHIEVEMENTS & MILESTONES
          ------------------------------------------------------------------- */}
          {activeTab === "achievements" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
                    Academic Milestones &amp; Badges
                  </h1>
                  <p className="text-xs sm:text-sm text-muted mt-0.5">
                    Milestones automatically verified against your genuine TiDB database exam record.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-accent/10 text-accent border border-accent/20">
                    {milestoneMedals.filter((m) => m.unlocked).length} / {milestoneMedals.length} Medals Unlocked
                  </span>
                </div>
              </div>

              {/* Top Verified Metrics Banner (4 Cards) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-card rounded-2xl p-4 border border-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted block">Writing Streak</span>
                    <strong className="text-lg font-extrabold font-heading text-foreground block">
                      {userStreak} {userStreak === 1 ? "Day" : "Days"}
                    </strong>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-4 border border-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted block">Essays Tested</span>
                    <strong className="text-lg font-extrabold font-heading text-foreground block">
                      {completedSubmissions.length} Tests
                    </strong>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-4 border border-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted block">Highest Band</span>
                    <strong className="text-lg font-extrabold font-heading text-emerald-500 block">
                      {highestBand ? `Band ${highestBand.toFixed(1)}` : "—"}
                    </strong>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-4 border border-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted block">Words Saved</span>
                    <strong className="text-lg font-extrabold font-heading text-purple-500 block">
                      {totalWordsSaved} Takeaways
                    </strong>
                  </div>
                </div>
              </div>

              {/* 9 Medals 3x3 Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {milestoneMedals.map((m) => {
                  const Icon = m.icon;
                  const progressPct = Math.min(100, Math.round((m.current / m.threshold) * 100));
                  return (
                    <div
                      key={m.id}
                      className={`glass-card rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                        m.unlocked
                          ? "border-accent/40 bg-accent/5 shadow-sm"
                          : "border-border/60 bg-surfaceSecondary/20 opacity-75"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              m.unlocked
                                ? "bg-accent/15 text-accent shadow-sm"
                                : "bg-surfaceSecondary text-muted"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>

                          {m.unlocked ? (
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

                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-surfaceSecondary text-muted">
                            {m.category}
                          </span>
                        </div>

                        <h3 className="font-bold font-heading text-sm text-foreground">
                          {m.name}
                        </h3>
                        <p className="text-xs text-muted mt-1 leading-relaxed">
                          {m.desc}
                        </p>
                      </div>

                      {/* Progress Bar for Locked / Completed for Unlocked */}
                      <div className="mt-4 pt-3 border-t border-border/60">
                        <div className="flex items-center justify-between text-[10px] font-semibold mb-1">
                          <span className="text-muted">Progress</span>
                          <span className={m.unlocked ? "text-emerald-500" : "text-muted"}>
                            {m.current} / {m.threshold}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-surfaceSecondary overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              m.unlocked ? "bg-emerald-500" : "bg-accent/70"
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------------
              TAB 6: DEEPSTUDY AI WRITING TUTOR
          ------------------------------------------------------------------- */}
          {activeTab === "deepstudy" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight flex items-center gap-2.5">
                    <Sparkles className="w-7 h-7 text-accent" />
                    <span>DeepStudy AI Writing Tutor</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-muted mt-0.5">
                    Cambridge-calibrated examiner AI &bull; Brainstorm, refine thesis statements, and master IELTS collocations in {nativeLanguage}.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Free AI Rotation Online</span>
                  </span>
                </div>
              </div>

              {/* Mode Selection Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {[
                  { id: "general", label: "General Coach", icon: Bot },
                  { id: "brainstorm", label: "Essay Brainstorming", icon: Lightbulb },
                  { id: "thesis", label: "Thesis Feedback", icon: Target },
                  { id: "paraphrase", label: "Paraphrasing Tool", icon: RefreshCw },
                  { id: "grammar", label: "Grammar Clinic", icon: Layers },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = aiTutorMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setAiTutorMode(mode.id as any)}
                      className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                        isSelected
                          ? "bg-[#E31837] text-white shadow-md shadow-[#E31837]/25"
                          : "glass-pill text-muted hover:text-foreground border border-border"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Lockdown Notice if Exam in progress */}
              {isLocked ? (
                <div className="glass-card rounded-3xl p-10 border border-red-500/30 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold font-heading text-foreground">
                    Examination Lockdown Active ({formatCountdown(remainingLockSeconds)})
                  </h3>
                  <p className="text-xs text-muted max-w-md leading-relaxed">
                    DeepStudy AI Tutor is strictly disabled during active timed examinations to ensure complete testing integrity and authentic exam simulation.
                  </p>
                  <span className="text-[11px] text-accent font-semibold">
                    Access will automatically unlock when cooldown completes.
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Quick Prompt Suggestions */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
                    <span className="text-muted font-bold uppercase tracking-wider shrink-0 text-[10px]">
                      Quick Prompts:
                    </span>
                    {[
                      {
                        label: "Brainstorm: AI in Higher Education",
                        text: "Brainstorm 3 balanced arguments for IELTS Task 2: Artificial Intelligence in Higher Education (advantages vs drawbacks).",
                      },
                      {
                        label: "Critique Thesis: Remote Work",
                        text: "Critique my thesis statement: Although remote working reduces commuting stress, the erosion of team synergy poses a graver challenge to corporate productivity.",
                      },
                      {
                        label: "Paraphrase: Task 1 Trend",
                        text: "Paraphrase this Task 1 opening sentence: The chart illustrates the significant increase in renewable energy production in five European nations between 2010 and 2024.",
                      },
                      {
                        label: "GRA: Participle Clauses",
                        text: "How can I combine these sentences using an introductory participle clause: The government invested heavily in clean transport. They noticed an immediate decline in particulate pollution.",
                      },
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAiTutorInput(p.text)}
                        className="px-3 py-1.5 rounded-xl glass-pill border border-border/80 text-muted hover:text-foreground hover:border-accent/40 whitespace-nowrap transition-colors shrink-0"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Chat Container */}
                  <div className="glass-card rounded-3xl border border-border flex flex-col h-[520px] overflow-hidden shadow-lg">
                    {/* Chat Messages Feed */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                      {aiTutorMessages.map((msg, idx) => {
                        const isUser = msg.role === "user";
                        return (
                          <div
                            key={idx}
                            className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                          >
                            <div className="flex items-center gap-1.5 mb-1 text-[10px] text-muted">
                              {!isUser && (
                                <span className="font-bold text-accent flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  <span>DeepStudy Examiner</span>
                                </span>
                              )}
                              <span>{msg.timestamp}</span>
                            </div>

                            <div
                              className={`rounded-2xl p-4 leading-relaxed max-w-[85%] sm:max-w-[75%] whitespace-pre-wrap ${
                                isUser
                                  ? "bg-[#E31837] text-white shadow-md shadow-[#E31837]/25 font-medium"
                                  : "glass-card border border-border bg-surfaceSecondary/60 text-foreground"
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        );
                      })}

                      {isAiTutorThinking && (
                        <div className="flex flex-col items-start space-y-1">
                          <span className="text-[10px] text-muted font-bold text-accent flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>DeepStudy Examiner</span>
                          </span>
                          <div className="glass-card border border-border rounded-2xl p-4 text-muted flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-accent" />
                            <span className="text-xs">Analyzing with Cambridge Writing Rubric...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat Input Bar */}
                    <div className="p-3.5 border-t border-border bg-surfaceSecondary/40 flex items-center gap-2.5">
                      <input
                        type="text"
                        value={aiTutorInput}
                        disabled={isAiTutorThinking}
                        onChange={(e) => setAiTutorInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendAiTutorMessage();
                          }
                        }}
                        placeholder={
                          aiTutorMode === "brainstorm"
                            ? "Enter an IELTS essay topic to brainstorm ideas..."
                            : aiTutorMode === "thesis"
                            ? "Paste your thesis statement for band evaluation..."
                            : aiTutorMode === "paraphrase"
                            ? "Paste a sentence or Task 1 prompt to paraphrase..."
                            : aiTutorMode === "grammar"
                            ? "Ask a grammar question or paste a sentence to polish..."
                            : "Ask any IELTS Academic Writing question..."
                        }
                        className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground text-xs focus:outline-none focus:border-accent transition-all placeholder:text-muted"
                      />

                      <button
                        type="button"
                        onClick={handleSendAiTutorMessage}
                        disabled={!aiTutorInput.trim() || isAiTutorThinking}
                        className="px-4 py-2.5 rounded-xl bg-[#E31837] text-white font-bold text-xs shadow-md shadow-[#E31837]/25 hover:bg-[#BE123C] flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0"
                      >
                        {isAiTutorThinking ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">Send</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          3. TWO-COLUMN SETTINGS MODAL
      ========================================================================= */}
      <AnimatePresence>
        {isSettingsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={iosSpring}
              className="glass-card w-full max-w-2xl rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden bg-surface/95 backdrop-blur-xl flex flex-col md:flex-row max-h-[85vh]"
            >
              {/* Left Column: Settings Tabs */}
              <div className="w-full md:w-56 p-5 border-b md:border-b-0 md:border-r border-border shrink-0 bg-surfaceSecondary/30 space-y-1 text-xs">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                    <Settings className="w-4 h-4" />
                  </div>
                  <h2 className="font-bold font-heading text-sm text-foreground">
                    Settings
                  </h2>
                </div>

                {[
                  { id: "general", label: "General & Appearance", icon: Sun },
                  { id: "account", label: "Account & Security", icon: User },
                  { id: "language", label: "Native Language", icon: Languages },
                ].map((st) => {
                  const Icon = st.icon;
                  const isSelected = settingsTab === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => setSettingsTab(st.id as any)}
                      className={`w-full py-2 px-3 rounded-xl text-left font-semibold flex items-center gap-2 transition-colors ${
                        isSelected
                          ? "bg-[#E31837] text-white shadow-sm"
                          : "text-muted hover:text-foreground hover:bg-surfaceSecondary"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Settings Tab Content */}
              <div className="flex-1 p-6 overflow-y-auto space-y-5 text-xs">
                {/* Modal Close Button */}
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <span className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                    {settingsTab === "general" && "Appearance Preferences"}
                    {settingsTab === "account" && "Student Account Profile"}
                    {settingsTab === "language" && "Native Language Translation"}
                  </span>
                  <button
                    onClick={() => setIsSettingsModalOpen(false)}
                    className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surfaceSecondary transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* TAB: GENERAL */}
                {settingsTab === "general" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-semibold text-foreground mb-1.5">
                        Color Theme
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            if (theme !== "light") toggleTheme();
                          }}
                          className={`flex-1 p-3 rounded-2xl border text-center transition-all ${
                            theme === "light"
                              ? "border-accent bg-accent/5 font-bold text-foreground"
                              : "border-border text-muted hover:text-foreground"
                          }`}
                        >
                          <Sun className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                          <span>Light Mode</span>
                        </button>
                        <button
                          onClick={() => {
                            if (theme !== "dark") toggleTheme();
                          }}
                          className={`flex-1 p-3 rounded-2xl border text-center transition-all ${
                            theme === "dark"
                              ? "border-accent bg-accent/5 font-bold text-foreground"
                              : "border-border text-muted hover:text-foreground"
                          }`}
                        >
                          <Moon className="w-4 h-4 mx-auto mb-1 text-slate-400" />
                          <span>Dark Mode</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-surfaceSecondary/50 border border-border">
                      <span className="font-bold text-foreground block mb-1">
                        iOS Liquid Glass Aesthetic
                      </span>
                      <p className="text-muted leading-relaxed text-[11px]">
                        IELTSPen Ai renders translucent multi-layer glass panels with responsive ambient light drift and Plus Jakarta Sans typography.
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB: ACCOUNT */}
                {settingsTab === "account" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-semibold text-foreground mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full p-2.5 rounded-xl glass-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-foreground mb-1.5">
                        Username Handle
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-muted font-mono font-bold text-xs pointer-events-none">
                          @
                        </span>
                        <input
                          type="text"
                          value={editUsername}
                          onChange={(e) =>
                            setEditUsername(
                              e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9_]/g, "")
                                .slice(0, 30)
                            )
                          }
                          placeholder="yourhandle"
                          className="w-full pl-7 pr-3 py-2.5 rounded-xl glass-input text-xs font-mono font-semibold"
                        />
                      </div>
                      <span className="text-[10px] text-muted mt-1 block">
                        Letters, numbers, and underscores only (3-30 chars).
                      </span>
                    </div>

                    <div>
                      <label className="block font-semibold text-foreground mb-1.5">
                        Bio / IELTS Target
                      </label>
                      <textarea
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value.slice(0, 500))}
                        rows={2}
                        placeholder="e.g. Aiming for Band 8.0 in Academic Writing &bull; Computer Science Aspirant"
                        className="w-full p-2.5 rounded-xl glass-input text-xs resize-none"
                      />
                      <span className="text-[10px] text-muted mt-0.5 block text-right">
                        {editBio.length} / 500 characters
                      </span>
                    </div>

                    {/* Public Profile Privacy Toggle */}
                    <div className="p-3.5 rounded-2xl bg-surfaceSecondary/50 border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 pr-2">
                          <span className="font-bold text-foreground block text-xs">
                            Make Profile Public
                          </span>
                          <p className="text-[11px] text-muted leading-relaxed">
                            Allow peers and mentors to view your verified 2026 activity heatmap, streak, and milestone badges.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={editIsProfilePublic}
                            onChange={(e) => setEditIsProfilePublic(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-surfaceSecondary border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E31837]" />
                        </label>
                      </div>

                      {/* Direct Link to Profile */}
                      {(username || editUsername) && (
                        <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-muted truncate">
                            /u/{username || editUsername}
                          </span>
                          <Link
                            href={`/u/${username || editUsername}`}
                            target="_blank"
                            className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1 shrink-0"
                          >
                            <span>View Public Page</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block font-semibold text-foreground mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="text"
                        value={userEmail}
                        disabled
                        className="w-full p-2.5 rounded-xl glass-input text-xs bg-surfaceSecondary/50 text-muted cursor-not-allowed font-mono"
                      />
                      <span className="text-[10px] text-muted mt-1 block">
                        Account email is verified with TiDB Cloud Auth.
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-surfaceSecondary border border-border">
                        <span className="text-[10px] text-muted block">Exam Merit Score</span>
                        <strong className="text-sm font-bold text-emerald-500">
                          {meritScore}% Clean
                        </strong>
                      </div>
                      <div className="p-3 rounded-xl bg-surfaceSecondary border border-border">
                        <span className="text-[10px] text-muted block">Security Standing</span>
                        <strong className="text-sm font-bold text-foreground">
                          {isLocked ? "Temporary Lock" : "Unlocked"}
                        </strong>
                      </div>
                    </div>

                    {settingsError && (
                      <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-semibold">
                        {settingsError}
                      </div>
                    )}

                    <button
                      onClick={handleSaveSettings}
                      disabled={isSavingSettings}
                      className="w-full py-2.5 rounded-xl bg-[#E31837] text-white font-bold text-xs shadow-md shadow-[#E31837]/25 hover:bg-[#BE123C] transition-all flex items-center justify-center gap-2"
                    >
                      {isSavingSettings ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <span>Save Profile Changes</span>
                      )}
                    </button>

                    {settingsSavedToast && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-center font-semibold text-xs flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Profile updated in TiDB!</span>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: LANGUAGE */}
                {settingsTab === "language" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-semibold text-foreground mb-1.5">
                        Select Native Language
                      </label>
                      <select
                        value={nativeLanguage}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="w-full p-2.5 rounded-xl glass-input text-xs cursor-pointer bg-surface text-foreground"
                      >
                        {NATIVE_LANGUAGES.map((lang) => (
                          <option key={lang} value={lang}>
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20">
                      <span className="font-bold text-accent block mb-1">
                        Instant Multi-Language Evaluation:
                      </span>
                      <p className="text-muted leading-relaxed text-[11px]">
                        All AI sentence corrections, grammar breakdowns, and Band 9 takeaways will be seamlessly translated into{" "}
                        <strong className="text-foreground">{nativeLanguage}</strong>.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          4. IN-APP FILE VIEWER MODAL
      ========================================================================= */}
      <AnimatePresence>
        {viewerFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={iosSpring}
              className="glass-card w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden bg-surface/95 backdrop-blur-xl"
            >
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent block">
                    {viewerFile.category}
                  </span>
                  <h2 className="text-base font-bold font-heading text-foreground">
                    {viewerFile.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`${viewerFile.file_url}?download=1`}
                    download={viewerFile.file_name}
                    className="px-3 py-1.5 rounded-xl bg-[#E31837] text-white font-semibold text-xs shadow-md shadow-[#E31837]/25 hover:bg-[#BE123C] flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>

                  <button
                    onClick={() => setViewerFile(null)}
                    className="p-1.5 rounded-xl text-muted hover:text-foreground hover:bg-surfaceSecondary transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Viewer Body */}
              <div className="flex-1 overflow-auto p-4 bg-background/50 flex items-center justify-center min-h-[300px]">
                {viewerFile.file_type.includes("pdf") || viewerFile.file_name.endsWith(".pdf") ? (
                  <iframe
                    src={viewerFile.file_url}
                    title={viewerFile.title}
                    className="w-full h-[65vh] rounded-2xl border border-border bg-white"
                  />
                ) : (
                  <div className="max-h-[65vh] flex items-center justify-center">
                    <img
                      src={viewerFile.file_url}
                      alt={viewerFile.title}
                      className="max-h-[65vh] w-auto rounded-2xl object-contain border border-border shadow-lg"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          5. UNLOCK APPEAL MODAL
      ========================================================================= */}
      <AnimatePresence>
        {isAppealModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={iosSpring}
              className="glass-card w-full max-w-md rounded-3xl p-6 border border-border shadow-2xl bg-surface/95 backdrop-blur-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2 text-red-500 font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Submit Exam Unlock Appeal</span>
                </div>
                <button
                  onClick={() => setIsAppealModalOpen(false)}
                  className="p-1 rounded-lg text-muted hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitAppeal} className="space-y-4 text-xs">
                <p className="text-muted leading-relaxed">
                  Provide a brief explanation for your tab violation. An administrator will review your standing.
                </p>

                <textarea
                  value={appealMessage}
                  onChange={(e) => setAppealMessage(e.target.value)}
                  placeholder="Explain what happened (e.g., accidental tab switch, browser notification)..."
                  maxLength={200}
                  rows={4}
                  className="w-full p-3 rounded-2xl glass-input text-xs"
                  required
                />

                <button
                  type="submit"
                  disabled={isSubmittingAppeal || !appealMessage.trim()}
                  className="w-full py-2.5 rounded-xl bg-red-500 text-white font-bold text-xs shadow-md shadow-red-500/25 hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmittingAppeal ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Appeal...</span>
                    </>
                  ) : (
                    <span>Submit Appeal</span>
                  )}
                </button>

                {appealSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-center font-semibold text-xs">
                    Appeal submitted to Admin Studio!
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          6. EVALUATION REVIEW MODAL
      ========================================================================= */}
      {reviewModalData.isOpen && reviewModalData.submission && reviewModalData.task && (
        <EvaluationReviewModal
          isOpen={reviewModalData.isOpen}
          onClose={() =>
            setReviewModalData({
              isOpen: false,
              submission: null,
              task: null,
            })
          }
          submissionId={reviewModalData.submission.id}
          taskId={reviewModalData.task.id}
          taskTitle={reviewModalData.task.title}
          taskType={reviewModalData.task.task_type}
          essayText={reviewModalData.submission.essay_text || reviewModalData.submission.student_essay || ""}
          wordCount={reviewModalData.submission.word_count || 0}
          overallBand={Number(reviewModalData.submission.overall_band) || 6.5}
          criteriaScores={reviewModalData.submission.criteria_scores}
          corrections={reviewModalData.submission.corrections || []}
          defaultLanguage={nativeLanguage}
          modelAnswer={reviewModalData.task.model_answer}
        />
      )}
    </div>
  );
}
