"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import BrandLogo from "@/components/brand/BrandLogo";
import IELTSChart from "@/components/charts/IELTSChart";
import EvaluationReviewModal from "@/components/results/EvaluationReviewModal";
import { INITIAL_TASKS } from "@/lib/mock-tasks";
import { WritingTask } from "@/lib/types";
import {
  iosSpring,
  tactilePress,
  backdropVariants,
  fadeInScaleVariants,
} from "@/lib/motion";
import {
  Clock,
  Send,
  AlertTriangle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Loader2,
  EyeOff,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function PracticeStudioPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<WritingTask | null>(null);
  const [essayText, setEssayText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [nativeLanguage, setNativeLanguage] = useState("English");

  // Timer: 20 mins for Task 1 (1200s), 40 mins for Task 2 (2400s)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1200);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  // Anti-Cheat Engine State
  const [strikeCount, setStrikeCount] = useState<number>(0);
  const [activeStrikeModal, setActiveStrikeModal] = useState<1 | 2 | null>(null);
  const [isScreenBlurred, setIsScreenBlurred] = useState<boolean>(false);

  // Mobile Top Sheet Collapse
  const [isMobilePromptOpen, setIsMobilePromptOpen] = useState(true);

  // Post-submission evaluation modal
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);
  const [completedSubmissionId, setCompletedSubmissionId] = useState<string | null>(null);

  // Draft persistence in localStorage
  const draftStorageKey = `ieltspen_draft_${taskId}`;

  // Word count computation
  const wordCount = essayText.trim().split(/\s+/).filter(Boolean).length;
  const minRequiredWords = task?.task_type === "task_1" ? 150 : 250;
  const isWordCountSufficient = wordCount >= minRequiredWords;

  // 1. Initial Load: Auth, Task & Local Draft
  useEffect(() => {
    // Lock body scroll during test session
    document.body.style.overflow = "hidden";

    async function initTest() {
      try {
        // Check auth and user profile
        const userRes = await fetch("/api/auth/me");
        if (!userRes.ok) {
          router.push(`/login?redirectTo=/practice/${taskId}`);
          return;
        }

        const userData = await userRes.json();
        const user = userData.user;
        if (!user) {
          router.push(`/login?redirectTo=/practice/${taskId}`);
          return;
        }

        setUserId(user.id);
        if (user.native_language) setNativeLanguage(user.native_language);

        if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
          router.push("/dashboard");
          return;
        }

        // Fetch task details from API (fallback to mock tasks)
        const taskRes = await fetch(`/api/tasks/${taskId}`);
        if (taskRes.ok) {
          const taskData = await taskRes.json();
          if (taskData.task) {
            setTask(taskData.task);
            const duration = taskData.task.task_type === "task_1" ? 20 * 60 : 40 * 60;
            setSecondsRemaining(duration);
          }
        } else {
          const fallback = INITIAL_TASKS.find((t) => t.id === taskId) || null;
          if (fallback) {
            setTask(fallback);
            const duration = fallback.task_type === "task_1" ? 20 * 60 : 40 * 60;
            setSecondsRemaining(duration);
          }
        }

        // Restore saved draft
        const savedDraft = localStorage.getItem(draftStorageKey);
        if (savedDraft) {
          setEssayText(savedDraft);
        }
      } catch (err) {
        console.error("initTest error:", err);
      }
    }

    initTest();

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [taskId, router, draftStorageKey]);

  // 2. Draft Auto-Saving
  useEffect(() => {
    if (essayText) {
      localStorage.setItem(draftStorageKey, essayText);
    }
  }, [essayText, draftStorageKey]);

  // 3. Countdown Timer
  useEffect(() => {
    if (secondsRemaining <= 0 || isSubmitting || isTerminated || evaluationResult) {
      if (secondsRemaining <= 0 && !isSubmitting && !evaluationResult) {
        handleAutoSubmit();
      }
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, isSubmitting, isTerminated, evaluationResult]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // 4. Anti-Cheat Engine: Strike 3 Termination Handler
  const handleStrike3Termination = useCallback(async () => {
    setIsTerminated(true);
    if (!userId) {
      router.push("/dashboard");
      return;
    }

    try {
      await fetch("/api/student/lockout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          essayText: essayText || "[Test terminated for tab switching violations]",
          wordCount,
          tabViolations: 3,
        }),
      });

      localStorage.removeItem(draftStorageKey);
    } catch (err) {
      console.error("Termination record failed:", err);
    } finally {
      router.push("/dashboard");
    }
  }, [userId, taskId, essayText, wordCount, draftStorageKey, router]);

  // 5. Anti-Cheat: Visibility & Focus Detection (3-Strike System)
  useEffect(() => {
    if (isTerminated || evaluationResult) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsScreenBlurred(true);
        setStrikeCount((prev) => {
          const next = prev + 1;
          if (next === 1) {
            setActiveStrikeModal(1);
          } else if (next === 2) {
            setActiveStrikeModal(2);
          } else if (next >= 3) {
            handleStrike3Termination();
          }
          return next;
        });
      } else {
        // Returned to window
        setIsScreenBlurred(false);
      }
    };

    const handleWindowBlur = () => {
      setIsScreenBlurred(true);
    };

    const handleWindowFocus = () => {
      setIsScreenBlurred(false);
    };

    // Keyboard & Screenshot protection
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent PrintScreen
      if (e.key === "PrintScreen") {
        e.preventDefault();
        setIsScreenBlurred(true);
        setTimeout(() => setIsScreenBlurred(false), 2000);
      }

      // Block Ctrl/Cmd + C, V, X, U, S, P, F12
      const isModifier = e.ctrlKey || e.metaKey;
      if (
        (isModifier &&
          ["c", "v", "x", "u", "s", "p"].includes(e.key.toLowerCase())) ||
        e.key === "F12"
      ) {
        e.preventDefault();
      }
    };

    // Block right click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Block copy, cut, paste
    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("cut", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("cut", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
    };
  }, [isTerminated, evaluationResult, handleStrike3Termination]);

  // 6. Essay Submission Execution
  const handleAutoSubmit = () => {
    executeSubmission(true);
  };

  const executeSubmission = async (isAuto: boolean = false) => {
    if (!essayText.trim()) {
      alert("Please enter your essay before submitting.");
      return;
    }

    if (!isAuto && !isWordCountSufficient) {
      const confirmLowWords = window.confirm(
        `Your essay currently has ${wordCount} words (minimum required is ${minRequiredWords}). Submitting under the word requirement may penalize your Task Achievement score. Do you wish to proceed?`
      );
      if (!confirmLowWords) return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          taskType: task?.task_type || "task_2",
          promptText: task?.prompt_text || "",
          essayText,
          nativeLanguage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission evaluation failed.");
      }

      // Success
      localStorage.removeItem(draftStorageKey);
      setCompletedSubmissionId(data.submissionId);
      setEvaluationResult(data.evaluation);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {}
    } catch (err: any) {
      alert(err.message || "Failed to evaluate essay.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background select-none">
      {/* 1. THIN FROSTED TOP BAR */}
      <header className="h-14 shrink-0 glass-nav px-4 sm:px-6 flex items-center justify-between border-b border-border z-30">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="hidden sm:inline-flex">
            <BrandLogo variant="auto" showSlogan={false} height={24} />
          </Link>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <h1 className="text-xs sm:text-sm font-bold font-heading text-foreground truncate max-w-[220px] sm:max-w-md">
            {task?.title || "IELTS Writing Studio"}
          </h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* Live Word Counter */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span
              className={`px-2.5 py-1 rounded-full border transition-colors ${
                isWordCountSufficient
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : wordCount >= minRequiredWords * 0.75
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  : "bg-red-500/10 text-red-500 border-red-500/20"
              }`}
            >
              {wordCount} / {minRequiredWords} words
            </span>
          </div>

          {/* Live Countdown Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surfaceSecondary text-xs font-mono font-bold text-foreground border border-border">
            <Clock
              className={`w-3.5 h-3.5 ${
                secondsRemaining <= 300 ? "text-accent animate-pulse" : "text-muted"
              }`}
            />
            <span className={secondsRemaining <= 300 ? "text-accent" : ""}>
              {formatTimer(secondsRemaining)}
            </span>
          </div>

          {/* Submit Essay Button */}
          <motion.button
            {...tactilePress}
            onClick={() => executeSubmission(false)}
            disabled={isSubmitting}
            className="px-4 py-1.5 rounded-xl bg-[#E31837] text-white font-semibold text-xs shadow-md shadow-[#E31837]/25 hover:bg-[#BE123C] disabled:opacity-60 transition-colors flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <span>Submit Essay</span>
                <Send className="w-3 h-3" />
              </>
            )}
          </motion.button>
        </div>
      </header>

      {/* 2. DUAL-PANE DESKTOP / MOBILE RESPONSIVE WRITING STUDIO */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* LEFT PANE: OFFICIAL PROMPT & RECHARTS (45% width on desktop, independent scroll) */}
        <div
          className={`w-full md:w-[45%] h-full overflow-y-auto border-r border-border p-5 sm:p-7 glass-panel select-none transition-all duration-300 ${
            isMobilePromptOpen ? "block" : "hidden md:block"
          }`}
        >
          {/* Task Type Header */}
          <div className="flex items-center justify-between mb-4">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                task?.task_type === "task_1"
                  ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                  : "bg-purple-500/10 text-purple-500 border border-purple-500/20"
              }`}
            >
              {task?.task_type === "task_1"
                ? "Academic Task 1 &bull; Visual Data"
                : "Academic Task 2 &bull; Essay"}
            </span>

            <span className="text-xs text-muted font-medium">
              Target: {minRequiredWords}+ words
            </span>
          </div>

          {/* Prompt Text */}
          <div className="text-xs sm:text-sm font-sans leading-relaxed text-foreground/90 whitespace-pre-wrap mb-5">
            {task?.prompt_text}
          </div>

          {/* Interactive Recharts Data Visualization (if Task 1) */}
          {task?.task_type === "task_1" && task.chart_data && (
            <div className="my-4">
              <IELTSChart chartData={task.chart_data as any} />
            </div>
          )}

          {/* Exam Condition Notice */}
          <div className="mt-6 p-4 rounded-2xl bg-surfaceSecondary/50 border border-border text-[11px] text-muted space-y-1">
            <p className="font-semibold text-foreground">
              Official IELTS Exam Regulations:
            </p>
            <p>
              &bull; External resources &amp; Free Assets are locked during exam conditions.
            </p>
            <p>
              &bull; Spellcheck and automated grammars are strictly disabled.
            </p>
            <p>
              &bull; Switching tabs will trigger immediate security strikes.
            </p>
          </div>
        </div>

        {/* MOBILE PROMPT TOGGLE BUTTON */}
        <div className="md:hidden w-full px-4 py-2 bg-surfaceSecondary/90 border-b border-border flex items-center justify-between text-xs font-semibold text-foreground">
          <span>{task?.title}</span>
          <button
            onClick={() => setIsMobilePromptOpen(!isMobilePromptOpen)}
            className="flex items-center gap-1 text-accent text-xs"
          >
            <span>{isMobilePromptOpen ? "Hide Prompt" : "View Prompt"}</span>
            {isMobilePromptOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* RIGHT PANE: DISTRACTION-FREE WRITING CANVAS (55% width on desktop, 92% frosted opacity) */}
        <div className="w-full md:w-[55%] h-full flex flex-col p-4 sm:p-6 bg-surface/92 backdrop-blur-md relative">
          <div className="flex-1 w-full h-full relative">
            <textarea
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              placeholder="Begin drafting your IELTS essay here. Focus on clear paragraph transitions, precise academic vocabulary, and robust grammar..."
              spellCheck={false}
              autoCorrect="off"
              autoComplete="off"
              className="w-full h-full p-4 sm:p-6 rounded-2xl bg-transparent border-0 outline-none text-foreground text-sm sm:text-base font-sans leading-relaxed resize-none selection:bg-accent/20"
            />
          </div>

          {/* Sticky Bottom Status */}
          <div className="shrink-0 pt-2 flex items-center justify-between text-xs text-muted border-t border-border/40">
            <span>
              Draft auto-saved &bull; {wordCount} words
            </span>
            <span>
              {minRequiredWords - wordCount > 0
                ? `${minRequiredWords - wordCount} words to reach minimum`
                : "Minimum word count satisfied"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. SCREEN BLUR SHIELD (Triggered on Window Blur or Screenshot Attempt) */}
      <AnimatePresence>
        {isScreenBlurred && !isTerminated && !evaluationResult && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center text-white"
          >
            <div className="w-16 h-16 rounded-3xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent mb-4">
              <EyeOff className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold font-heading mb-1">
              Exam Security Shield Active
            </h2>
            <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
              Window focus lost. Return your cursor to the IELTS writing editor to resume your test session.
            </p>
            <button
              onClick={() => setIsScreenBlurred(false)}
              className="px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-xs shadow-lg"
            >
              Resume Test Session
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. ANTI-CHEAT STRIKE 1 & 2 MODALS */}
      <AnimatePresence>
        {activeStrikeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              variants={fadeInScaleVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-md glass-card rounded-3xl p-7 border border-amber-500/40 text-center shadow-2xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto mb-4">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                Security Warning &bull; Strike {activeStrikeModal}/3
              </span>

              <h2 className="text-lg font-bold font-heading text-foreground mt-1 mb-2">
                {activeStrikeModal === 1
                  ? "Screen or Tab Switch Detected"
                  : "Final Warning Before Termination"}
              </h2>

              <p className="text-xs text-muted leading-relaxed mb-6">
                {activeStrikeModal === 1
                  ? "You have left the exam window (Warning 1/3). Switching tabs or applications is strictly prohibited under authentic IELTS examination guidelines."
                  : "One more tab switch or window departure will immediately terminate this test session, record a cheat violation, and lock your account for 15 minutes."}
              </p>

              <motion.button
                {...tactilePress}
                onClick={() => setActiveStrikeModal(null)}
                className="w-full py-3 rounded-xl bg-amber-500 text-white font-semibold text-xs shadow-md shadow-amber-500/25 hover:bg-amber-600 transition-colors"
              >
                I Understand &amp; Return to Exam
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. POST-SUBMISSION EVALUATION REVIEW MODAL */}
      {evaluationResult && (
        <EvaluationReviewModal
          isOpen={!!evaluationResult}
          onClose={() => router.push("/dashboard")}
          submissionId={completedSubmissionId || "local-" + Date.now()}
          taskId={taskId}
          taskTitle={task?.title || "IELTS Writing Simulation"}
          taskType={task?.task_type || "task_2"}
          essayText={essayText}
          wordCount={evaluationResult.word_count || wordCount}
          overallBand={evaluationResult.overall_band || 7.0}
          criteriaScores={evaluationResult.criteria_scores}
          corrections={evaluationResult.corrections || []}
          defaultLanguage={nativeLanguage}
          modelAnswer={task?.model_answer || null}
        />
      )}
    </div>
  );
}
