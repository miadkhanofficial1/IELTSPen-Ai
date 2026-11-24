"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import BrandLogo from "@/components/brand/BrandLogo";
import IELTSChart from "@/components/charts/IELTSChart";
import { useTheme } from "@/components/ThemeProvider";
import {
  iosSpring,
  tactilePress,
  tactileButton,
  fadeInScaleVariants,
} from "@/lib/motion";
import {
  LayoutDashboard,
  Sparkles,
  ShieldAlert,
  Users,
  Cpu,
  Key,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Unlock,
  Lock,
  ArrowRight,
  LogOut,
  Sun,
  Moon,
  Search,
  ExternalLink,
  Loader2,
  FileText,
  Save,
  RotateCcw,
  Check,
  AlertTriangle,
  Play,
  Pause,
  BarChart2,
  FilePlus,
  X,
  Layers,
  FolderDown,
  Download,
  Eye,
  FileUp,
  File,
  Upload,
} from "lucide-react";
import {
  WritingTask,
  UserProfile as Profile,
  UnlockAppeal,
  AiApiKeyRecord as AiApiKey,
  AiProvider,
  FreeAssetFile,
} from "@/lib/types";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Active admin tab
  const [activeTab, setActiveTab] = useState<
    "overview" | "content" | "assets" | "appeals" | "students" | "settings"
  >("overview");

  // Free Assets Manager State
  const [assetFiles, setAssetFiles] = useState<FreeAssetFile[]>([]);
  const [assetCategoryFilter, setAssetCategoryFilter] = useState<string>("all");
  const [isUploadingAsset, setIsUploadingAsset] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState<string>("");
  const [uploadCategory, setUploadCategory] = useState<string>("Cheat Sheet");
  const [uploadDescription, setUploadDescription] = useState<string>("");
  const [previewAssetFile, setPreviewAssetFile] = useState<FreeAssetFile | null>(null);

  // Admin user state
  const [adminUser, setAdminUser] = useState<any>(null);

  // Data Collections
  const [tasks, setTasks] = useState<WritingTask[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [appeals, setAppeals] = useState<(UnlockAppeal & { profile?: Profile })[]>([]);
  const [apiKeys, setApiKeys] = useState<AiApiKey[]>([]);
  const [todaySubmissionsCount, setTodaySubmissionsCount] = useState<number>(0);

  // System Settings state
  const [dailyLimit, setDailyLimit] = useState<number>(3);
  const [evaluationsPaused, setEvaluationsPaused] = useState<boolean>(false);
  const [globalAnnouncement, setGlobalAnnouncement] = useState<string>("");
  const [creatorBio, setCreatorBio] = useState({
    name: "MD. MIAD IBNA NOOR",
    role: "Founder, MK.Studio",
    location: "Dhaka, Bangladesh",
    github: "https://github.com/miadkhanofficial1",
    linkedin: "https://www.linkedin.com/in/miadkhanofficial",
    portfolio: "https://www.behance.net/miadkhan",
    email: "miadkhan.official1@gmail.com",
  });

  // Task Generator State
  const [genTaskType, setGenTaskType] = useState<"task_1" | "task_2">("task_2");
  const [genCategory, setGenCategory] = useState<string>("Technology");
  const [genBatchCount, setGenBatchCount] = useState<number>(1);
  const [genCustomTopic, setGenCustomTopic] = useState<string>("");
  const [isGeneratingTask, setIsGeneratingTask] = useState<boolean>(false);
  const [previewDraft, setPreviewDraft] = useState<WritingTask | null>(null);

  // Manual Task Creator State
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [manualTaskType, setManualTaskType] = useState<"task_1" | "task_2">("task_2");
  const [manualCategory, setManualCategory] = useState<string>("Technology");
  const [manualTitle, setManualTitle] = useState<string>("");
  const [manualPromptText, setManualPromptText] = useState<string>("");
  const [manualChartJson, setManualChartJson] = useState<string>("");
  const [manualModelAnswer, setManualModelAnswer] = useState<string>("");
  const [manualStatus, setManualStatus] = useState<"draft" | "published">("published");
  const [isCreatingManualTask, setIsCreatingManualTask] = useState<boolean>(false);

  // Real-time parsed chart preview for Manual Creator
  const parsedManualChart = useMemo(() => {
    if (manualTaskType !== "task_1" || !manualChartJson.trim()) return null;
    try {
      const parsed = JSON.parse(manualChartJson.trim());
      if (parsed && Array.isArray(parsed.data) && parsed.data.length > 0) {
        return parsed;
      }
    } catch {
      return null;
    }
    return null;
  }, [manualTaskType, manualChartJson]);

  // Sample templates for manual Task 1
  const loadChartTemplate = (type: "bar" | "line" | "pie") => {
    if (type === "bar") {
      setManualChartJson(
        JSON.stringify(
          {
            type: "bar",
            title: "Global Renewable Energy Generation (TWh)",
            xAxisKey: "year",
            series: [
              { key: "solar", label: "Solar Energy", color: "#F59E0B" },
              { key: "wind", label: "Wind Power", color: "#3B82F6" },
              { key: "hydro", label: "Hydroelectric", color: "#10B981" },
            ],
            data: [
              { year: "2018", solar: 580, wind: 1260, hydro: 4190 },
              { year: "2020", solar: 850, wind: 1600, hydro: 4350 },
              { year: "2022", solar: 1280, wind: 2100, hydro: 4330 },
              { year: "2024", solar: 1680, wind: 2450, hydro: 4410 },
            ],
          },
          null,
          2
        )
      );
    } else if (type === "line") {
      setManualChartJson(
        JSON.stringify(
          {
            type: "line",
            title: "Average Daily Screen Time (Hours/Day)",
            xAxisKey: "year",
            series: [
              { key: "teens", label: "Teens (13-18)", color: "#E31837" },
              { key: "adults", label: "Adults (19-45)", color: "#3B82F6" },
              { key: "seniors", label: "Seniors (65+)", color: "#10B981" },
            ],
            data: [
              { year: "2016", teens: 4.8, adults: 3.5, seniors: 1.8 },
              { year: "2018", teens: 5.9, adults: 4.2, seniors: 2.1 },
              { year: "2020", teens: 7.6, adults: 5.8, seniors: 2.9 },
              { year: "2022", teens: 7.9, adults: 5.5, seniors: 3.2 },
              { year: "2024", teens: 8.4, adults: 5.9, seniors: 3.5 },
            ],
          },
          null,
          2
        )
      );
    } else {
      setManualChartJson(
        JSON.stringify(
          {
            type: "pie",
            title: "Global Household Water Consumption (%)",
            xAxisKey: "name",
            series: [{ key: "value", label: "Percentage", color: "#E31837" }],
            data: [
              { name: "Toilet Flushing", value: 32 },
              { name: "Shower & Bath", value: 28 },
              { name: "Laundry", value: 18 },
              { name: "Kitchen & Cooking", value: 12 },
              { name: "Other Domestic", value: 10 },
            ],
          },
          null,
          2
        )
      );
    }
  };

  // Student Search
  const [studentSearch, setStudentSearch] = useState<string>("");

  // Add API Key Form
  const [newKeyProvider, setNewKeyProvider] = useState<AiProvider>("gemini");
  const [newKeyModel, setNewKeyModel] = useState<string>("gemini-1.5-flash");
  const [newKeySecret, setNewKeySecret] = useState<string>("");
  const [newKeyPriority, setNewKeyPriority] = useState<number>(1);
  const [isAddingKey, setIsAddingKey] = useState<boolean>(false);
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, string>>({});

  // 1. Load Admin Data
  useEffect(() => {
    async function loadAdminData() {
      try {
        const res = await fetch("/api/admin/data");
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            router.push("/login");
          }
          return;
        }

        const data = await res.json();
        if (data.tasks) setTasks(data.tasks);
        if (data.students) setStudents(data.students);
        if (data.appeals) setAppeals(data.appeals);
        if (data.apiKeys) setApiKeys(data.apiKeys);
        if (data.settings) {
          const s = data.settings;
          if (typeof s.daily_submission_limit === "number") setDailyLimit(s.daily_submission_limit);
          if (typeof s.ai_evaluations_paused === "boolean") setEvaluationsPaused(s.ai_evaluations_paused);
          if (s.global_announcement) setGlobalAnnouncement(s.global_announcement);
          if (s.creator_bio) setCreatorBio(s.creator_bio);
        }
        if (data.stats && typeof data.stats.todayEvaluations === "number") {
          setTodaySubmissionsCount(data.stats.todayEvaluations);
        }

        // Load free asset files
        try {
          const assetRes = await fetch("/api/admin/assets");
          if (assetRes.ok) {
            const assetData = await assetRes.json();
            if (assetData.files) setAssetFiles(assetData.files);
          }
        } catch (e) {
          console.warn("Could not load asset files:", e);
        }
      } catch (err) {
        console.error("Error loading admin data:", err);
      }
    }

    loadAdminData();

    // Fast polling for Appeals (replacing Supabase Realtime)
    const appealsTimer = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/appeals");
        if (res.ok) {
          const data = await res.json();
          if (data.appeals) {
            setAppeals(data.appeals);
          }
        }
      } catch (e) {
        // Ignore polling glitches
      }
    }, 5000);

    return () => clearInterval(appealsTimer);
  }, [router]);

  // Provider Default Model Auto-Filler
  useEffect(() => {
    if (newKeyProvider === "gemini") setNewKeyModel("gemini-1.5-flash");
    if (newKeyProvider === "groq") setNewKeyModel("llama-3.3-70b-versatile");
    if (newKeyProvider === "openrouter")
      setNewKeyModel("meta-llama/llama-3.3-70b-instruct:free");
    if (newKeyProvider === "mistral") setNewKeyModel("mistral-small-latest");
  }, [newKeyProvider]);

  // 2. Action: One-Click AI Task Generation
  const handleGenerateTasks = async () => {
    setIsGeneratingTask(true);
    try {
      const res = await fetch("/api/admin/generate-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskType: genTaskType,
          topicCategory: genCategory,
          batchCount: genBatchCount,
          customPrompt: genCustomTopic.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      if (data.tasks && data.tasks.length > 0) {
        setTasks((prev) => [...data.tasks, ...prev]);
        setPreviewDraft(data.tasks[0]);
      }
    } catch (err: any) {
      alert(err.message || "Could not generate task.");
    } finally {
      setIsGeneratingTask(false);
    }
  };

  // 2.1 Action: Create Manual Task
  const handleCreateManualTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) {
      alert("Please provide a Task Title.");
      return;
    }
    if (!manualPromptText.trim()) {
      alert("Please provide the official IELTS Prompt Text.");
      return;
    }

    let parsedChart: any = null;
    if (manualTaskType === "task_1" && manualChartJson.trim()) {
      try {
        parsedChart = JSON.parse(manualChartJson.trim());
      } catch (err: any) {
        alert("Invalid Chart Data JSON. Please ensure valid JSON or clear the field.");
        return;
      }
    }

    setIsCreatingManualTask(true);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_task",
          taskType: manualTaskType,
          topicCategory: manualCategory.trim() || "General",
          title: manualTitle.trim(),
          promptText: manualPromptText.trim(),
          chartData: parsedChart,
          modelAnswer: manualModelAnswer.trim(),
          status: manualStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create task.");
      }

      setTasks((prev) => [data.task, ...prev]);
      setPreviewDraft(data.task);
      setIsManualModalOpen(false);

      // Reset fields
      setManualTitle("");
      setManualPromptText("");
      setManualChartJson("");
      setManualModelAnswer("");
      setManualStatus("published");
    } catch (err: any) {
      alert(err.message || "Failed to create manual task.");
    } finally {
      setIsCreatingManualTask(false);
    }
  };

  // 3. Action: Publish Draft Task
  const handlePublishTask = async (taskId: string) => {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish_task", taskId }),
      });

      if (!res.ok) throw new Error("Failed to publish task.");

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: "published", published_at: new Date().toISOString() }
            : t
        )
      );

      if (previewDraft?.id === taskId) {
        setPreviewDraft((prev) => (prev ? { ...prev, status: "published" } : null));
      }
    } catch (err) {
      alert("Failed to publish task.");
    }
  };

  // 4. Action: Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_task", taskId }),
      });

      if (!res.ok) throw new Error("Failed to delete task.");

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (previewDraft?.id === taskId) setPreviewDraft(null);
    } catch (err) {
      alert("Failed to delete task.");
    }
  };

  // 5. Action: Resolve Unlock Appeal
  const handleResolveAppeal = async (
    appealId: string,
    studentId: string,
    action: "approved_restored" | "approved_only" | "dismissed"
  ) => {
    try {
      const res = await fetch("/api/admin/appeals/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appealId, studentId, action }),
      });

      if (!res.ok) throw new Error("Could not resolve appeal.");

      // Remove from pending appeals list
      setAppeals((prev) => prev.filter((a) => a.id !== appealId));

      // Refresh student status in local table
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === studentId) {
            return {
              ...s,
              locked_until: null,
              merit_score:
                action === "approved_restored"
                  ? Math.min(100, (s.merit_score ?? 90) + 10)
                  : s.merit_score,
            };
          }
          return s;
        })
      );
    } catch (err: any) {
      alert(err.message || "Failed to resolve appeal");
    }
  };

  // 6. Action: Manual Lock / Unlock Student
  const handleToggleStudentLock = async (studentId: string, currentlyLocked: boolean) => {
    try {
      const res = await fetch("/api/admin/students/toggle-lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          shouldLock: !currentlyLocked,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to update lock status");

      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, locked_until: data.locked_until } : s))
      );
    } catch (err) {
      alert("Failed to toggle student lock.");
    }
  };

  // 7. Action: Save New API Key
  const handleAddApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeySecret.trim()) return;

    setIsAddingKey(true);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_key",
          provider: newKeyProvider,
          modelName: newKeyModel,
          apiKey: newKeySecret.trim(),
          priority: Number(newKeyPriority) || 1,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setApiKeys((prev) => [
          ...prev,
          {
            id: data.keyId,
            provider: newKeyProvider,
            model_name: newKeyModel,
            api_key: newKeySecret.trim(),
            api_key_masked: newKeySecret.trim().slice(0, 4) + "...",
            priority: Number(newKeyPriority) || 1,
            is_active: true,
            call_count: 0,
            error_count: 0,
            last_used_at: null,
            created_at: new Date().toISOString(),
          } as any,
        ]);
        setNewKeySecret("");
      } else {
        alert(data.error || "Could not insert API key.");
      }
    } catch (err) {
      alert("Error adding key.");
    } finally {
      setIsAddingKey(false);
    }
  };

  // 8. Action: Test API Key Connection
  const handleTestKey = async (key: AiApiKey) => {
    setTestingKeyId(key.id);
    try {
      const res = await fetch("/api/admin/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: key.provider,
          modelName: (key as any).model_name || "default",
          apiKey: key.api_key,
        }),
      });

      const data = await res.json();
      setTestResult((prev) => ({
        ...prev,
        [key.id]: data.success
          ? `✓ Active (${data.latencyMs}ms)`
          : `✗ Error: ${data.error || "Failed"}`,
      }));
    } catch (err) {
      setTestResult((prev) => ({
        ...prev,
        [key.id]: "✗ Ping failed",
      }));
    } finally {
      setTestingKeyId(null);
    }
  };

  // 9. Action: Toggle Key Active/Paused
  const handleToggleKeyActive = async (keyId: string, currentActive: boolean) => {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_key", keyId, isActive: !currentActive }),
      });

      if (res.ok) {
        setApiKeys((prev) =>
          prev.map((k) => (k.id === keyId ? { ...k, is_active: !currentActive } : k))
        );
      } else {
        alert("Failed to toggle status.");
      }
    } catch (err) {
      alert("Failed to toggle status.");
    }
  };

  // 10. Action: Delete Key
  const handleDeleteKey = async (keyId: string) => {
    if (!window.confirm("Delete this AI API key?")) return;
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_key", keyId }),
      });

      if (res.ok) {
        setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
      } else {
        alert("Failed to delete key.");
      }
    } catch (err) {
      alert("Failed to delete key.");
    }
  };

  // 11. Action: Save System Settings
  const handleSaveSystemSettings = async () => {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_settings",
          dailyLimit,
          evaluationsPaused,
          announcement: globalAnnouncement || null,
          creatorBio,
        }),
      });

      if (res.ok) {
        alert("System settings and Creator Profile updated successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update system settings.");
      }
    } catch (err) {
      alert("Failed to update system settings.");
    }
  };

  // 12. Action: Upload Study Asset File
  const handleUploadAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      alert("Please select a study file to upload (PDF, JPG, PNG, WEBP).");
      return;
    }
    if (!uploadTitle.trim()) {
      alert("Please enter a title for this asset.");
      return;
    }

    setIsUploadingAsset(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("title", uploadTitle.trim());
      formData.append("category", uploadCategory.trim());
      formData.append("description", uploadDescription.trim());

      const res = await fetch("/api/admin/assets", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      setAssetFiles((prev) => [data.asset, ...prev]);
      setUploadFile(null);
      setUploadTitle("");
      setUploadDescription("");
      alert("Study asset uploaded successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to upload study asset.");
    } finally {
      setIsUploadingAsset(false);
    }
  };

  // 13. Action: Delete Study Asset File
  const handleDeleteAsset = async (assetId: string) => {
    if (!window.confirm("Are you sure you want to delete this study file?")) return;
    try {
      const res = await fetch("/api/admin/assets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId }),
      });

      if (!res.ok) throw new Error("Failed to delete asset.");
      setAssetFiles((prev) => prev.filter((a) => a.id !== assetId));
      if (previewAssetFile?.id === assetId) setPreviewAssetFile(null);
    } catch (err) {
      alert("Failed to delete asset.");
    }
  };

  // Filtered Asset Files
  const filteredAssetFiles = useMemo(() => {
    if (assetCategoryFilter === "all") return assetFiles;
    return assetFiles.filter(
      (a) => a.category.toLowerCase() === assetCategoryFilter.toLowerCase()
    );
  }, [assetFiles, assetCategoryFilter]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = studentSearch.toLowerCase();
      return (
        s.full_name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.native_language?.toLowerCase().includes(q)
      );
    });
  }, [students, studentSearch]);

  const pendingAppealsCount = appeals.length;

  return (
    <div className="flex min-h-screen bg-background selection:bg-accent/20">
      {/* 1. STICKY FULL-HEIGHT FROSTED GLASS LEFT SIDEBAR */}
      <aside className="sticky top-0 h-screen shrink-0 w-64 glass-nav flex flex-col justify-between overflow-y-auto border-r border-border z-30">
        <div className="flex flex-col">
          {/* Top Brand Logo Block: Clean Left-Aligned with proper padding and border-b */}
          <div className="px-6 pt-6 pb-4 border-b border-border/60">
            <Link href="/" className="flex flex-col items-start text-left group">
              <div className="flex items-center justify-start">
                <BrandLogo variant="auto" showSlogan={false} height={28} className="w-auto" />
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent font-mono">
                  Admin Studio
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Tabs */}
          <nav className="p-4 space-y-1.5 text-xs font-semibold">
            {[
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              { id: "content", label: "AI Content Studio", icon: Sparkles },
              {
                id: "assets",
                label: "Free Assets",
                icon: FolderDown,
                badge: assetFiles.length > 0 ? assetFiles.length : undefined,
              },
              {
                id: "appeals",
                label: "Unlock Appeals",
                icon: ShieldAlert,
                badge: pendingAppealsCount,
              },
              { id: "students", label: "Students & Merit", icon: Users },
              { id: "settings", label: "API & System Limits", icon: Cpu },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full py-2.5 px-3.5 rounded-xl flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-[#E31837] text-white shadow-md shadow-[#E31837]/25"
                      : "text-muted hover:text-foreground hover:bg-surfaceSecondary"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>

                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isSelected ? "bg-white text-accent" : "bg-accent text-white"
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

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-border flex items-center justify-between shrink-0 bg-surface/40 backdrop-blur-md">
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

          <button
            onClick={async () => {
              try {
                await fetch("/api/auth/logout", { method: "POST" });
              } catch (e) {}
              router.push("/");
            }}
            className="text-xs font-semibold text-muted hover:text-foreground flex items-center gap-1.5 p-2 rounded-xl glass-pill transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN ADMIN CONTENT WORKSPACE */}
      <main className="flex-1 min-w-0 p-5 sm:p-8 md:p-10 max-w-6xl w-full">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
                Studio Overview
              </h1>
              <p className="text-xs sm:text-sm text-muted mt-0.5">
                Real-time IELTS platform metrics, AI rotation activity, and student safety health.
              </p>
            </div>

            {/* 4 iOS Glass Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Students",
                  val: students.length,
                  icon: Users,
                  color: "text-blue-500",
                },
                {
                  label: "Published Topics",
                  val: tasks.filter((t) => t.status === "published").length,
                  icon: FileText,
                  color: "text-purple-500",
                },
                {
                  label: "Today's AI Evaluations",
                  val: todaySubmissionsCount,
                  icon: Sparkles,
                  color: "text-accent",
                },
                {
                  label: "Pending Appeals",
                  val: pendingAppealsCount,
                  icon: ShieldAlert,
                  color: pendingAppealsCount > 0 ? "text-red-500" : "text-emerald-500",
                },
              ].map((m, i) => {
                const Icon = m.icon;
                return (
                  <div
                    key={i}
                    className="glass-card rounded-2xl p-5 border border-border flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-muted">{m.label}</span>
                      <Icon className={`w-4 h-4 ${m.color}`} />
                    </div>
                    <span className="text-3xl font-extrabold font-heading text-foreground">
                      {m.val}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Quick Action Shortcuts */}
            <div className="p-6 rounded-3xl glass-card border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold font-heading text-foreground">
                  Quick Actions
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Generate new exam content or moderate flagged student appeals.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab("content")}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-xs shadow-md shadow-accent/25 hover:bg-accent-hover transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate New Task</span>
                </button>

                <button
                  onClick={() => setActiveTab("appeals")}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl glass-pill font-semibold text-xs text-foreground border border-border hover:bg-surfaceSecondary transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                  <span>Review Appeals ({pendingAppealsCount})</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI CONTENT STUDIO */}
        {activeTab === "content" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
                  AI Content Studio
                </h1>
                <p className="text-xs sm:text-sm text-muted mt-0.5">
                  Generate authentic Cambridge-grade Task 1 &amp; 2 prompts, charts, model essays, and vocabulary assets.
                </p>
              </div>

              <motion.button
                {...tactileButton}
                onClick={() => setIsManualModalOpen(true)}
                className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#E31837] to-rose-600 text-white font-semibold text-xs shadow-lg shadow-[#E31837]/25 hover:brightness-110 transition-all flex items-center gap-2"
              >
                <FilePlus className="w-4 h-4" />
                <span>+ Create Manual Task</span>
              </motion.button>
            </div>

            {/* Generator Control Panel */}
            <div className="glass-card rounded-3xl p-6 border border-border space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold font-heading text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>One-Click Task Generator</span>
                </h2>
                <span className="text-[11px] text-muted hidden sm:inline">
                  AI Multi-Provider or Instant Built-in Engine
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Task Type */}
                <div>
                  <label className="block font-semibold text-foreground mb-1.5">
                    Task Type
                  </label>
                  <select
                    value={genTaskType}
                    onChange={(e) => setGenTaskType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl glass-input bg-surface text-foreground cursor-pointer"
                  >
                    <option value="task_1">Writing Task 1 (Academic Chart/Data)</option>
                    <option value="task_2">Writing Task 2 (Discursive Essay)</option>
                  </select>
                </div>

                {/* Topic Category */}
                <div>
                  <label className="block font-semibold text-foreground mb-1.5">
                    Topic Category
                  </label>
                  <select
                    value={genCategory}
                    onChange={(e) => setGenCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-input bg-surface text-foreground cursor-pointer"
                  >
                    <option value="Environment">Environment &amp; Climate</option>
                    <option value="Technology">Technology &amp; AI</option>
                    <option value="Education">Education &amp; Literacy</option>
                    <option value="Health">Health &amp; Medicine</option>
                    <option value="Work & Economy">Work, Business &amp; Economy</option>
                    <option value="Society">Society, Culture &amp; Urbanization</option>
                    <option value="Random">Random Surprising Category</option>
                  </select>
                </div>

                {/* Batch Count */}
                <div>
                  <label className="block font-semibold text-foreground mb-1.5">
                    Batch Count
                  </label>
                  <select
                    value={genBatchCount}
                    onChange={(e) => setGenBatchCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl glass-input bg-surface text-foreground cursor-pointer"
                  >
                    <option value="1">1 Task (Instant)</option>
                    <option value="3">3 Tasks (Batch)</option>
                    <option value="5">5 Tasks (Deep Pool)</option>
                  </select>
                </div>
              </div>

              {/* Custom Topic / Short Prompt (Optional) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-xs text-foreground">
                    Custom Topic / Short Prompt <span className="text-muted font-normal">(Optional)</span>
                  </label>
                  {genCustomTopic && (
                    <button
                      type="button"
                      onClick={() => setGenCustomTopic("")}
                      className="text-[11px] text-muted hover:text-accent transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={genCustomTopic}
                  onChange={(e) => setGenCustomTopic(e.target.value)}
                  placeholder={
                    genTaskType === "task_1"
                      ? "e.g., Bar chart comparing renewable energy in 4 Asian countries (2018-2024)..."
                      : "e.g., Remote work impact on urban traffic and housing prices..."
                  }
                  className="w-full px-4 py-2.5 rounded-xl glass-input bg-surface text-foreground text-xs placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-muted font-medium">Quick ideas:</span>
                  {(genTaskType === "task_1"
                    ? [
                        "Bar chart comparing renewable energy in 4 Asian countries",
                        "Line graph of global screen time (2016-2024)",
                        "Household water consumption distribution",
                      ]
                    : [
                        "Remote work impact on urban traffic",
                        "Artificial intelligence replacing creative jobs",
                        "Free public university tuition pros & cons",
                      ]
                  ).map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setGenCustomTopic(chip)}
                      className="px-2.5 py-1 rounded-lg text-[10px] glass-pill border border-border text-muted hover:text-foreground hover:border-accent/40 transition-colors"
                    >
                      &ldquo;{chip}&rdquo;
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                {...tactilePress}
                onClick={handleGenerateTasks}
                disabled={isGeneratingTask}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#E31837] text-white font-semibold text-xs shadow-md shadow-[#E31837]/25 hover:bg-[#BE123C] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {isGeneratingTask ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Exam Standards &amp; Vocabulary...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate with AI</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Generated Draft Preview Inspector */}
            {previewDraft && (
              <div className="glass-card rounded-3xl p-6 border border-accent/40 bg-accent/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent text-white">
                      Inspect Draft
                    </span>
                    <span className="text-xs text-muted">{previewDraft.topic_category}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {previewDraft.status === "draft" ? (
                      <button
                        onClick={() => handlePublishTask(previewDraft.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-semibold text-xs shadow-sm hover:bg-emerald-600 transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Publish Live</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Published Live
                      </span>
                    )}

                    <button
                      onClick={() => handleDeleteTask(previewDraft.id)}
                      className="p-1.5 rounded-xl text-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold font-heading text-foreground">
                  {previewDraft.title}
                </h3>
                <p className="text-xs text-muted leading-relaxed whitespace-pre-wrap font-sans">
                  {previewDraft.prompt_text}
                </p>

                {previewDraft.chart_data && (
                  <div className="my-3">
                    <IELTSChart chartData={previewDraft.chart_data as any} />
                  </div>
                )}

                {/* Model Answer Preview */}
                <div className="p-4 rounded-2xl bg-surfaceSecondary border border-border text-xs leading-relaxed">
                  <span className="font-bold text-accent uppercase text-[10px] block mb-1">
                    Band 9.0 Model Answer (Locked from students until test completion):
                  </span>
                  <p className="whitespace-pre-wrap text-foreground/90 font-sans">
                    {previewDraft.model_answer}
                  </p>
                </div>
              </div>
            )}

            {/* Task Library Table */}
            <div className="glass-card rounded-3xl p-6 border border-border space-y-4">
              <h2 className="text-base font-bold font-heading text-foreground">
                Task Library ({tasks.length})
              </h2>

              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <div className="p-8 rounded-2xl glass-panel border border-border text-center flex flex-col items-center">
                    <FileText className="w-8 h-8 text-muted mb-2 opacity-60" />
                    <p className="font-semibold text-foreground">No writing tasks created yet</p>
                    <p className="text-muted text-[11px] mt-1">
                      Click "+ Create Manual Task" or use the One-Click Task Generator above to publish your first task.
                    </p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 rounded-2xl glass-panel border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              task.task_type === "task_1"
                                ? "bg-blue-500/10 text-blue-500"
                                : "bg-purple-500/10 text-purple-500"
                            }`}
                          >
                            {task.task_type}
                          </span>
                          <span className="text-muted font-medium">
                            {task.topic_category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              task.status === "published"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-amber-500/10 text-amber-500"
                            }`}
                          >
                            {task.status.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="font-bold text-foreground font-heading">
                          {task.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => setPreviewDraft(task)}
                          className="px-3 py-1.5 rounded-xl glass-pill font-semibold text-xs text-foreground border border-border hover:bg-surfaceSecondary"
                        >
                          Inspect
                        </button>

                        {task.status === "draft" && (
                          <button
                            onClick={() => handlePublishTask(task.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-semibold text-xs shadow-sm hover:bg-emerald-600"
                          >
                            Publish
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 rounded-xl text-muted hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* MANUAL TASK AUTHORING MODAL */}
            <AnimatePresence>
              {isManualModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={iosSpring}
                    className="glass-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 bg-surface/95 backdrop-blur-xl"
                  >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between border-b border-border pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                          <FilePlus className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold font-heading text-foreground">
                            Create Manual Writing Task
                          </h2>
                          <p className="text-xs text-muted">
                            Author custom Cambridge-aligned IELTS prompts, charts, and model answers.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsManualModalOpen(false)}
                        className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-surfaceSecondary transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Form Body */}
                    <div className="space-y-4 text-xs">
                      {/* Task Type & Category Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-foreground mb-1.5">
                            Task Type
                          </label>
                          <select
                            value={manualTaskType}
                            onChange={(e) => setManualTaskType(e.target.value as any)}
                            className="w-full p-2.5 rounded-xl glass-input bg-surface text-foreground cursor-pointer"
                          >
                            <option value="task_1">Writing Task 1 (Academic Chart/Data)</option>
                            <option value="task_2">Writing Task 2 (Discursive Essay)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-foreground mb-1.5">
                            Topic Category
                          </label>
                          <input
                            type="text"
                            value={manualCategory}
                            onChange={(e) => setManualCategory(e.target.value)}
                            placeholder="e.g., Environment, Technology, Education"
                            className="w-full p-2.5 rounded-xl glass-input bg-surface text-foreground"
                          />
                        </div>
                      </div>

                      {/* Task Title */}
                      <div>
                        <label className="block font-semibold text-foreground mb-1.5">
                          Task Title *
                        </label>
                        <input
                          type="text"
                          value={manualTitle}
                          onChange={(e) => setManualTitle(e.target.value)}
                          placeholder="e.g., Renewable Energy Generation Trends (2018–2024)"
                          className="w-full p-2.5 rounded-xl glass-input bg-surface text-foreground font-medium"
                        />
                      </div>

                      {/* Prompt Text */}
                      <div>
                        <label className="block font-semibold text-foreground mb-1.5">
                          Prompt Text / Cambridge Instructions *
                        </label>
                        <textarea
                          rows={4}
                          value={manualPromptText}
                          onChange={(e) => setManualPromptText(e.target.value)}
                          placeholder="You should spend about 20/40 minutes on this task. Write about the following topic..."
                          className="w-full p-3 rounded-xl glass-input bg-surface text-foreground font-sans leading-relaxed"
                        />
                      </div>

                      {/* Task 1 Chart Configuration */}
                      {manualTaskType === "task_1" && (
                        <div className="p-4 rounded-2xl border border-accent/20 bg-accent/5 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <BarChart2 className="w-4 h-4 text-accent" />
                              <label className="font-bold text-foreground">
                                Chart Data (JSON Specification)
                              </label>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-muted">Load Template:</span>
                              <button
                                type="button"
                                onClick={() => loadChartTemplate("bar")}
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface border border-border hover:bg-surfaceSecondary"
                              >
                                Bar
                              </button>
                              <button
                                type="button"
                                onClick={() => loadChartTemplate("line")}
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface border border-border hover:bg-surfaceSecondary"
                              >
                                Line
                              </button>
                              <button
                                type="button"
                                onClick={() => loadChartTemplate("pie")}
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface border border-border hover:bg-surfaceSecondary"
                              >
                                Pie
                              </button>
                            </div>
                          </div>

                          <textarea
                            rows={6}
                            value={manualChartJson}
                            onChange={(e) => setManualChartJson(e.target.value)}
                            placeholder='{"type": "bar", "title": "Chart Title", "xAxisKey": "year", "series": [...], "data": [...]}'
                            className="w-full p-3 rounded-xl font-mono text-[11px] glass-input bg-surface text-foreground"
                          />

                          {/* Visual Chart Live Preview */}
                          {parsedManualChart ? (
                            <div className="p-3 rounded-xl bg-surface border border-emerald-500/30 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Valid Chart Configuration Preview
                                </span>
                                <span className="text-[10px] font-mono text-muted">
                                  {parsedManualChart.type?.toUpperCase()}
                                </span>
                              </div>
                              <div className="h-56 w-full">
                                <IELTSChart chartData={parsedManualChart} />
                              </div>
                            </div>
                          ) : manualChartJson.trim() ? (
                            <p className="text-[11px] text-amber-500 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              JSON parsing error or invalid format (needs data array).
                            </p>
                          ) : null}
                        </div>
                      )}

                      {/* Band 9 Model Essay */}
                      <div>
                        <label className="block font-semibold text-foreground mb-1.5">
                          Band 9 Model Answer <span className="text-muted font-normal">(Optional)</span>
                        </label>
                        <textarea
                          rows={4}
                          value={manualModelAnswer}
                          onChange={(e) => setManualModelAnswer(e.target.value)}
                          placeholder="Paste high-scoring Cambridge Band 9 model essay..."
                          className="w-full p-3 rounded-xl glass-input bg-surface text-foreground font-sans leading-relaxed"
                        />
                      </div>

                      {/* Status Toggle */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-surfaceSecondary/50 border border-border">
                        <div>
                          <span className="font-semibold text-foreground block">
                            Publication Status
                          </span>
                          <span className="text-[11px] text-muted">
                            Published tasks will be instantly available in the Student Task Library.
                          </span>
                        </div>
                        <select
                          value={manualStatus}
                          onChange={(e) => setManualStatus(e.target.value as any)}
                          className="p-2 rounded-xl glass-input bg-surface text-foreground font-semibold cursor-pointer"
                        >
                          <option value="published">Publish Live</option>
                          <option value="draft">Save as Draft</option>
                        </select>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                      <button
                        onClick={() => setIsManualModalOpen(false)}
                        disabled={isCreatingManualTask}
                        className="px-4 py-2.5 rounded-xl glass-pill font-semibold text-xs text-muted hover:text-foreground transition-colors"
                      >
                        Cancel
                      </button>

                      <motion.button
                        {...tactileButton}
                        onClick={handleCreateManualTask}
                        disabled={isCreatingManualTask || !manualTitle.trim() || !manualPromptText.trim()}
                        className="px-6 py-2.5 rounded-xl bg-[#E31837] text-white font-semibold text-xs shadow-md shadow-[#E31837]/25 hover:bg-[#BE123C] disabled:opacity-50 transition-all flex items-center gap-2"
                      >
                        {isCreatingManualTask ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving Task...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>{manualStatus === "published" ? "Save & Publish" : "Save as Draft"}</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* TAB: FREE ASSETS MANAGER */}
        {activeTab === "assets" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight flex items-center gap-2.5">
                  <FolderDown className="w-7 h-7 text-accent" />
                  <span>Free Assets Manager</span>
                </h1>
                <p className="text-xs sm:text-sm text-muted mt-0.5">
                  Upload authentic Cambridge cheat sheets, Band 9 books, and chart guides for students.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
                  {assetFiles.length} Total Materials
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass-card rounded-2xl p-4 border border-border">
                <span className="text-[11px] font-medium text-muted block">Total Files</span>
                <span className="text-xl font-extrabold font-heading text-foreground mt-0.5 block">
                  {assetFiles.length}
                </span>
              </div>
              <div className="glass-card rounded-2xl p-4 border border-border">
                <span className="text-[11px] font-medium text-muted block">PDF Documents</span>
                <span className="text-xl font-extrabold font-heading text-red-500 mt-0.5 block">
                  {assetFiles.filter((f) => f.file_type.includes("pdf") || f.file_name.endsWith(".pdf")).length}
                </span>
              </div>
              <div className="glass-card rounded-2xl p-4 border border-border">
                <span className="text-[11px] font-medium text-muted block">Visual Charts / Images</span>
                <span className="text-xl font-extrabold font-heading text-emerald-500 mt-0.5 block">
                  {assetFiles.filter((f) => f.file_type.startsWith("image/") || !f.file_name.endsWith(".pdf")).length}
                </span>
              </div>
              <div className="glass-card rounded-2xl p-4 border border-border">
                <span className="text-[11px] font-medium text-muted block">Categories</span>
                <span className="text-xl font-extrabold font-heading text-purple-500 mt-0.5 block">
                  {new Set(assetFiles.map((f) => f.category)).size}
                </span>
              </div>
            </div>

            {/* File Upload Form */}
            <div className="glass-card rounded-3xl p-6 border border-border space-y-5">
              <h2 className="text-base font-bold font-heading text-foreground flex items-center gap-2">
                <FileUp className="w-4 h-4 text-accent" />
                <span>Upload New Study Material</span>
              </h2>

              <form onSubmit={handleUploadAsset} className="space-y-4 text-xs">
                {/* File Dropzone / Selector */}
                <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-accent/50 transition-colors bg-surfaceSecondary/30">
                  <input
                    type="file"
                    id="asset-file-input"
                    accept=".pdf, .jpg, .jpeg, .png, .webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setUploadFile(file);
                        if (!uploadTitle.trim()) {
                          const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
                          setUploadTitle(cleanName);
                        }
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="asset-file-input"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    {uploadFile ? (
                      <div>
                        <span className="font-bold text-foreground text-sm block">
                          {uploadFile.name}
                        </span>
                        <span className="text-[11px] text-muted">
                          {(uploadFile.size / 1024 / 1024).toFixed(2)} MB &bull; {uploadFile.type || "Selected File"}
                        </span>
                        <span className="text-[11px] text-accent block mt-1 underline">
                          Click to choose another file
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="font-bold text-foreground text-sm block">
                          Choose or drop a study file here
                        </span>
                        <span className="text-[11px] text-muted">
                          Supports PDF, JPG, PNG, WEBP (Max 15MB)
                        </span>
                      </div>
                    )}
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Asset Title */}
                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">
                      Asset Title *
                    </label>
                    <input
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="e.g., Cambridge Band 9 Academic Writing Blueprint"
                      className="w-full p-2.5 rounded-xl glass-input bg-surface text-foreground"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">
                      Category
                    </label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl glass-input bg-surface text-foreground cursor-pointer"
                    >
                      <option value="Cheat Sheet">Cheat Sheet</option>
                      <option value="Band 9 Essays">Band 9 Essays</option>
                      <option value="Chart Templates">Chart Templates</option>
                      <option value="Grammar Guide">Grammar Guide</option>
                      <option value="Vocabulary Bank">Vocabulary Bank</option>
                      <option value="General Resource">General Resource</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-semibold text-foreground mb-1.5">
                    Description <span className="text-muted font-normal">(Optional context for students)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Brief summary of what students will learn from this study file..."
                    className="w-full p-2.5 rounded-xl glass-input bg-surface text-foreground"
                  />
                </div>

                <motion.button
                  {...tactileButton}
                  type="submit"
                  disabled={isUploadingAsset || !uploadFile || !uploadTitle.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#E31837] text-white font-semibold text-xs shadow-md shadow-[#E31837]/25 hover:bg-[#BE123C] disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isUploadingAsset ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading Study Material...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload &amp; Publish for Students</span>
                    </>
                  )}
                </motion.button>
              </form>
            </div>

            {/* Uploaded Materials Library */}
            <div className="glass-card rounded-3xl p-6 border border-border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-base font-bold font-heading text-foreground">
                  Published Study Materials ({filteredAssetFiles.length})
                </h2>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {["all", "Cheat Sheet", "Band 9 Essays", "Chart Templates", "Vocabulary Bank", "Grammar Guide"].map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => setAssetCategoryFilter(cat)}
                        className={`px-3 py-1 rounded-xl font-semibold text-[11px] transition-colors ${
                          assetCategoryFilter.toLowerCase() === cat.toLowerCase()
                            ? "bg-[#E31837] text-white shadow-sm"
                            : "glass-pill text-muted hover:text-foreground"
                        }`}
                      >
                        {cat === "all" ? "All Categories" : cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              {filteredAssetFiles.length === 0 ? (
                <div className="text-center py-12 text-muted text-xs flex flex-col items-center justify-center">
                  <FolderDown className="w-8 h-8 text-muted mb-2 opacity-60" />
                  <p className="font-semibold text-foreground text-sm">No study materials uploaded yet</p>
                  <p className="text-muted text-[11px] mt-1 max-w-sm">
                    {assetCategoryFilter === "all"
                      ? "Upload official IELTS PDFs, cheat sheets, or chart templates above to share with students."
                      : "No materials match this category filter. Select another category or upload one above."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAssetFiles.map((file) => {
                    const isPdf = file.file_type.includes("pdf") || file.file_name.endsWith(".pdf");
                    return (
                      <div
                        key={file.id}
                        className="p-4 rounded-2xl glass-panel border border-border flex flex-col justify-between gap-3 text-xs"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                isPdf ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                              }`}
                            >
                              {isPdf ? "PDF Document" : "Visual Image"}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surfaceSecondary text-muted">
                              {file.category}
                            </span>
                          </div>

                          <h3 className="font-bold text-sm font-heading text-foreground line-clamp-1">
                            {file.title}
                          </h3>

                          {file.description && (
                            <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">
                              {file.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-border flex items-center justify-between">
                          <span className="text-[10px] font-mono text-muted">
                            {(file.file_size / 1024).toFixed(0)} KB &bull; {new Date(file.created_at).toLocaleDateString()}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setPreviewAssetFile(file)}
                              className="px-2.5 py-1 rounded-lg glass-pill font-semibold text-[11px] text-foreground hover:bg-surfaceSecondary flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5 text-accent" />
                              <span>Preview</span>
                            </button>

                            <a
                              href={`${file.file_url}?download=1`}
                              download={file.file_name}
                              className="px-2.5 py-1 rounded-lg glass-pill font-semibold text-[11px] text-foreground hover:bg-surfaceSecondary flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </a>

                            <button
                              onClick={() => handleDeleteAsset(file.id)}
                              className="p-1.5 rounded-lg text-muted hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* In-App Viewer Modal */}
            <AnimatePresence>
              {previewAssetFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={iosSpring}
                    className="glass-card w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden bg-surface/95 backdrop-blur-xl"
                  >
                    {/* Header */}
                    <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between shrink-0">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-accent block">
                          {previewAssetFile.category}
                        </span>
                        <h2 className="text-base font-bold font-heading text-foreground">
                          {previewAssetFile.title}
                        </h2>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`${previewAssetFile.file_url}?download=1`}
                          download={previewAssetFile.file_name}
                          className="px-3.5 py-1.5 rounded-xl bg-[#E31837] text-white font-semibold text-xs shadow-md shadow-[#E31837]/25 hover:bg-[#BE123C] flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>

                        <button
                          onClick={() => setPreviewAssetFile(null)}
                          className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-surfaceSecondary"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Content View */}
                    <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/10">
                      {previewAssetFile.file_type.includes("pdf") || previewAssetFile.file_name.endsWith(".pdf") ? (
                        <iframe
                          src={previewAssetFile.file_url}
                          className="w-full h-[72vh] rounded-2xl border border-border bg-white"
                          title={previewAssetFile.title}
                        />
                      ) : (
                        <img
                          src={previewAssetFile.file_url}
                          alt={previewAssetFile.title}
                          className="max-h-[72vh] max-w-full object-contain rounded-2xl shadow-lg mx-auto"
                        />
                      )}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* TAB 3: UNLOCK APPEALS QUEUE */}
        {activeTab === "appeals" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
                Unlock Appeals Queue ({appeals.length})
              </h1>
              <p className="text-xs sm:text-sm text-muted mt-0.5">
                Review tab-switching security violations and restore student examination merit.
              </p>
            </div>

            {appeals.length === 0 ? (
              <div className="glass-card rounded-3xl p-12 text-center flex flex-col items-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
                <h3 className="text-base font-bold font-heading text-foreground mb-1">
                  Queue Clean &bull; Zero Pending Appeals
                </h3>
                <p className="text-xs text-muted">
                  All security lockouts have been addressed or resolved.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {appeals.map((appeal) => (
                  <div
                    key={appeal.id}
                    className="glass-card rounded-3xl p-6 border border-red-500/30 flex flex-col gap-4 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                      <div>
                        <h4 className="font-bold text-sm font-heading text-foreground">
                          {appeal.profile?.full_name || "Student"} &bull;{" "}
                          <span className="text-muted font-normal">
                            {appeal.profile?.email}
                          </span>
                        </h4>
                        <span className="text-[11px] text-muted">
                          Language: {appeal.profile?.native_language || "English"} &bull; Current Merit:{" "}
                          <strong className="text-red-500">
                            {appeal.profile?.merit_score ?? 90}%
                          </strong>
                        </span>
                      </div>

                      <span className="text-[11px] font-mono text-muted">
                        Submitted: {new Date(appeal.created_at).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-surfaceSecondary border border-border">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
                        Student Message:
                      </span>
                      <p className="text-foreground text-xs leading-relaxed italic">
                        &ldquo;{appeal.message}&rdquo;
                      </p>
                    </div>

                    {/* 3 Action Buttons */}
                    <div className="flex items-center gap-3 self-end">
                      <button
                        onClick={() =>
                          handleResolveAppeal(
                            appeal.id,
                            appeal.user_id,
                            "approved_restored"
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-colors flex items-center gap-1.5"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Unlock &amp; Restore Merit (+10)</span>
                      </button>

                      <button
                        onClick={() =>
                          handleResolveAppeal(appeal.id, appeal.user_id, "approved_only")
                        }
                        className="px-3.5 py-2 rounded-xl glass-pill font-semibold text-xs text-foreground border border-border hover:bg-surfaceSecondary transition-colors"
                      >
                        <span>Unlock Only</span>
                      </button>

                      <button
                        onClick={() =>
                          handleResolveAppeal(appeal.id, appeal.user_id, "dismissed")
                        }
                        className="px-3.5 py-2 rounded-xl font-semibold text-xs text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <span>Dismiss Appeal</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: STUDENTS & MERIT */}
        {activeTab === "students" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
                  Students &amp; Merit Management
                </h1>
                <p className="text-xs sm:text-sm text-muted mt-0.5">
                  Monitor student integrity records and toggle manual exam lockouts.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            {/* Students Table */}
            <div className="glass-card rounded-3xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surfaceSecondary/80 border-b border-border text-[11px] font-bold text-muted uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Student</th>
                      <th className="p-4">Language</th>
                      <th className="p-4">Merit Score</th>
                      <th className="p-4">Lockout Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted">
                          {studentSearch.trim() ? "No students matched your search query." : "No registered students yet."}
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((st) => {
                        const isLocked =
                          st.locked_until &&
                          new Date(st.locked_until).getTime() > Date.now();

                        return (
                          <tr
                            key={st.id}
                            className="hover:bg-surfaceSecondary/40 transition-colors"
                          >
                            <td className="p-4">
                              <span className="font-bold text-foreground block">
                                {st.full_name || "Scholar"}
                              </span>
                              <span className="text-[11px] text-muted">{st.email}</span>
                            </td>
                            <td className="p-4 text-muted">{st.native_language}</td>
                            <td className="p-4">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                  (st.merit_score ?? 100) >= 80
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : "bg-red-500/10 text-red-500"
                                }`}
                              >
                                {st.merit_score ?? 100}%
                              </span>
                            </td>
                            <td className="p-4">
                              {isLocked ? (
                                <span className="text-red-500 font-bold flex items-center gap-1">
                                  <Lock className="w-3 h-3" />
                                  Locked (15m)
                                </span>
                              ) : (
                                <span className="text-emerald-500 font-medium flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  Active &bull; Unlocked
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() =>
                                  handleToggleStudentLock(st.id, !!isLocked)
                                }
                                className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors ${
                                  isLocked
                                    ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600"
                                    : "glass-pill text-red-500 border border-border hover:bg-red-500/10"
                                }`}
                              >
                                {isLocked ? "Unlock" : "Lock (15m)"}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: API & SYSTEM LIMITS */}
        {activeTab === "settings" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
                API &amp; System Controls
              </h1>
              <p className="text-xs sm:text-sm text-muted mt-0.5">
                Manage Multi-Provider AI rotation, submission limits, and founder branding.
              </p>
            </div>

            {/* AI API Keys Management */}
            <div className="glass-card rounded-3xl p-6 border border-border space-y-6">
              <h2 className="text-base font-bold font-heading text-foreground flex items-center gap-2">
                <Key className="w-4 h-4 text-accent" />
                <span>Multi-Provider AI Key Rotation</span>
              </h2>

              {/* Add Key Form */}
              <form
                onSubmit={handleAddApiKey}
                className="p-5 rounded-2xl bg-surfaceSecondary/50 border border-border space-y-4 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      Provider
                    </label>
                    <select
                      value={newKeyProvider}
                      onChange={(e) => setNewKeyProvider(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl glass-input bg-surface text-foreground cursor-pointer"
                    >
                      <option value="gemini">Google Gemini</option>
                      <option value="groq">Groq (Llama 3)</option>
                      <option value="openrouter">OpenRouter</option>
                      <option value="mistral">Mistral AI</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      Model Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newKeyModel}
                      onChange={(e) => setNewKeyModel(e.target.value)}
                      placeholder="e.g. gemini-1.5-flash"
                      className="w-full p-2.5 rounded-xl glass-input"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      API Secret Key
                    </label>
                    <input
                      type="password"
                      required
                      value={newKeySecret}
                      onChange={(e) => setNewKeySecret(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full p-2.5 rounded-xl glass-input font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      Failover Priority
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={newKeyPriority}
                      onChange={(e) => setNewKeyPriority(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl glass-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAddingKey || !newKeySecret.trim()}
                  className="px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-xs shadow-md shadow-accent/25 hover:bg-accent-hover transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register AI Key</span>
                </button>
              </form>

              {/* Saved Keys List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                  Active Provider Priority Chain ({apiKeys.length})
                </h3>

                {apiKeys.length === 0 ? (
                  <p className="text-xs text-muted">
                    No custom keys registered. System is operating on default fallback examiner algorithms.
                  </p>
                ) : (
                  apiKeys.map((k) => (
                    <div
                      key={k.id}
                      className="p-4 rounded-2xl glass-panel border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-surfaceSecondary border border-border flex items-center justify-center font-bold text-accent">
                          #{k.priority}
                        </span>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground uppercase">
                              {k.provider}
                            </span>
                            <span className="text-muted font-mono text-[11px]">
                              {k.model_name}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                k.is_active
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-amber-500/10 text-amber-500"
                              }`}
                            >
                              {k.is_active ? "ACTIVE" : "PAUSED"}
                            </span>
                          </div>

                          <span className="font-mono text-muted text-[11px] block mt-0.5">
                            Key: ••••••••••••{(k.api_key || "").slice(-4)} &bull; Used:{" "}
                            {k.daily_usage_count || 0} times today
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {testResult[k.id] && (
                          <span className="text-[11px] font-mono text-muted mr-1">
                            {testResult[k.id]}
                          </span>
                        )}

                        <button
                          onClick={() => handleTestKey(k)}
                          disabled={testingKeyId === k.id}
                          className="px-3 py-1.5 rounded-xl glass-pill font-semibold text-xs text-foreground border border-border hover:bg-surfaceSecondary flex items-center gap-1"
                        >
                          {testingKeyId === k.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Play className="w-3 h-3 text-emerald-500" />
                          )}
                          <span>Test</span>
                        </button>

                        <button
                          onClick={() => handleToggleKeyActive(k.id, k.is_active)}
                          className="px-3 py-1.5 rounded-xl glass-pill font-semibold text-xs text-muted hover:text-foreground border border-border"
                        >
                          {k.is_active ? "Pause" : "Resume"}
                        </button>

                        <button
                          onClick={() => handleDeleteKey(k.id)}
                          className="p-1.5 rounded-xl text-muted hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Global Controls & Creator Profile */}
            <div className="glass-card rounded-3xl p-6 border border-border space-y-6 text-xs">
              <h2 className="text-base font-bold font-heading text-foreground">
                Platform Limits &amp; Announcement
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-foreground mb-1.5">
                    Daily Submission Limit (per student)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl glass-input"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1.5">
                    AI Evaluation Engine Kill-Switch
                  </label>
                  <button
                    type="button"
                    onClick={() => setEvaluationsPaused(!evaluationsPaused)}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold flex items-center justify-between border transition-colors ${
                      evaluationsPaused
                        ? "bg-red-500/15 text-red-500 border-red-500/30"
                        : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    }`}
                  >
                    <span>
                      {evaluationsPaused ? "Evaluations PAUSED" : "Evaluations ACTIVE"}
                    </span>
                    <span>{evaluationsPaused ? "Click to Resume" : "Click to Pause"}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1.5">
                  Global Announcement Banner
                </label>
                <input
                  type="text"
                  value={globalAnnouncement}
                  onChange={(e) => setGlobalAnnouncement(e.target.value)}
                  placeholder="e.g. Cambridge 19 Task 1 practice sets added..."
                  className="w-full p-2.5 rounded-xl glass-input"
                />
              </div>

              {/* Creator Profile Form */}
              <div className="pt-4 border-t border-border space-y-4">
                <h3 className="text-sm font-bold font-heading text-foreground">
                  Founder &amp; Creator Profile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted mb-1">Name</label>
                    <input
                      type="text"
                      value={creatorBio.name}
                      onChange={(e) =>
                        setCreatorBio((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full p-2.5 rounded-xl glass-input"
                    />
                  </div>

                  <div>
                    <label className="block text-muted mb-1">Role &amp; Studio</label>
                    <input
                      type="text"
                      value={creatorBio.role}
                      onChange={(e) =>
                        setCreatorBio((prev) => ({ ...prev, role: e.target.value }))
                      }
                      className="w-full p-2.5 rounded-xl glass-input"
                    />
                  </div>

                  <div>
                    <label className="block text-muted mb-1">Location</label>
                    <input
                      type="text"
                      value={creatorBio.location}
                      onChange={(e) =>
                        setCreatorBio((prev) => ({ ...prev, location: e.target.value }))
                      }
                      className="w-full p-2.5 rounded-xl glass-input"
                    />
                  </div>

                  <div>
                    <label className="block text-muted mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={creatorBio.email}
                      onChange={(e) =>
                        setCreatorBio((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="w-full p-2.5 rounded-xl glass-input"
                    />
                  </div>

                  <div>
                    <label className="block text-muted mb-1">GitHub URL</label>
                    <input
                      type="url"
                      value={creatorBio.github}
                      onChange={(e) =>
                        setCreatorBio((prev) => ({ ...prev, github: e.target.value }))
                      }
                      className="w-full p-2.5 rounded-xl glass-input"
                    />
                  </div>

                  <div>
                    <label className="block text-muted mb-1">LinkedIn URL</label>
                    <input
                      type="url"
                      value={creatorBio.linkedin}
                      onChange={(e) =>
                        setCreatorBio((prev) => ({ ...prev, linkedin: e.target.value }))
                      }
                      className="w-full p-2.5 rounded-xl glass-input"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-muted mb-1">Portfolio (Behance) URL</label>
                    <input
                      type="url"
                      value={creatorBio.portfolio}
                      onChange={(e) =>
                        setCreatorBio((prev) => ({ ...prev, portfolio: e.target.value }))
                      }
                      className="w-full p-2.5 rounded-xl glass-input"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveSystemSettings}
                className="px-6 py-2.5 rounded-xl bg-accent text-white font-semibold text-xs shadow-md shadow-accent/25 hover:bg-accent-hover transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save All System Changes</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
