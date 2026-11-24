"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  iosSpring,
  backdropVariants,
  fadeInScaleVariants,
  tactilePress,
} from "@/lib/motion";
import {
  X,
  Award,
  CheckCircle2,
  AlertTriangle,
  Languages,
  BookOpen,
  ChevronDown,
  Sparkles,
  Loader2,
} from "lucide-react";
import { CriteriaScores, CorrectionItem } from "@/lib/types";

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

interface EvaluationReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string;
  taskId: string;
  taskTitle: string;
  taskType: "task_1" | "task_2";
  essayText: string;
  wordCount: number;
  overallBand: number;
  criteriaScores: CriteriaScores;
  corrections: CorrectionItem[];
  defaultLanguage?: string;
  modelAnswer?: string | null;
}

export const EvaluationReviewModal: React.FC<EvaluationReviewModalProps> = ({
  isOpen,
  onClose,
  submissionId,
  taskId,
  taskTitle,
  taskType,
  essayText,
  wordCount,
  overallBand,
  criteriaScores,
  corrections: initialCorrections,
  defaultLanguage = "English",
  modelAnswer: initialModelAnswer = null,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const [corrections, setCorrections] = useState<CorrectionItem[]>(initialCorrections);
  const [modelAnswer, setModelAnswer] = useState<string | null>(initialModelAnswer);
  const [loadingModelAnswer, setLoadingModelAnswer] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [translatingIndex, setTranslatingIndex] = useState<number | null>(null);

  // Handle dynamic language switching for localized explanations
  const handleLanguageChange = async (targetLang: string) => {
    setSelectedLanguage(targetLang);
    if (targetLang === "English") return;

    // Translate any correction that does not have targetLang cached yet
    for (let i = 0; i < corrections.length; i++) {
      const item = corrections[i];
      if (!item.localized_explanations?.[targetLang]) {
        try {
          setTranslatingIndex(i);
          const res = await fetch("/api/translate-feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              submissionId,
              correctionIndex: i,
              explanationEn: item.explanation_en,
              targetLanguage: targetLang,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.translated) {
              setCorrections((prev) => {
                const next = [...prev];
                next[i] = {
                  ...next[i],
                  localized_explanations: {
                    ...(next[i].localized_explanations || {}),
                    [targetLang]: data.translated,
                  },
                };
                return next;
              });
            }
          }
        } catch (err) {
          console.warn("Translation failed:", err);
        } finally {
          setTranslatingIndex(null);
        }
      }
    }
  };

  // Securely load model answer if requested and not loaded yet
  const handleToggleModelAnswer = async () => {
    if (!showModelAnswer && !modelAnswer) {
      try {
        setLoadingModelAnswer(true);
        const res = await fetch(`/api/tasks/${taskId}/model-answer`);
        if (res.ok) {
          const data = await res.json();
          setModelAnswer(data.model_answer);
        }
      } catch (err) {
        console.warn("Could not fetch model answer:", err);
      } finally {
        setLoadingModelAnswer(false);
      }
    }
    setShowModelAnswer(!showModelAnswer);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          variants={fadeInScaleVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative z-10 w-full max-w-4xl max-h-[92vh] flex flex-col glass-card rounded-3xl border border-border/80 shadow-2xl overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between shrink-0 glass-nav">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
                  {taskType === "task_1" ? "IELTS Task 1 Academic" : "IELTS Task 2 Essay"}
                </span>
                <span className="text-xs text-muted">&bull;</span>
                <span className="text-xs text-muted">{wordCount} Words</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold font-heading text-foreground mt-0.5 line-clamp-1">
                {taskTitle}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Native Language Switcher */}
              <div className="relative hidden sm:flex items-center">
                <Languages className="w-3.5 h-3.5 text-muted absolute left-3 pointer-events-none" />
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="pl-8 pr-7 py-1.5 rounded-xl glass-pill text-xs font-medium text-foreground bg-surface border border-border cursor-pointer appearance-none"
                >
                  {NATIVE_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang} className="bg-surface text-foreground">
                      {lang}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-muted absolute right-2.5 pointer-events-none" />
              </div>

              <motion.button
                {...tactilePress}
                onClick={onClose}
                aria-label="Close"
                className="p-2 rounded-xl glass-pill hover:bg-surfaceSecondary text-muted hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Body Content (Independent Vertical Scroll) */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
            {/* Top Score Banner: Overall Band & 4 Criteria */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {/* Overall Band Card */}
              <div className="sm:col-span-1 rounded-2xl p-4 bg-gradient-to-br from-accent to-[#BE123C] text-white flex flex-col items-center justify-center shadow-lg shadow-accent/25 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">
                  Overall Band
                </span>
                <span className="text-4xl font-extrabold font-heading my-0.5">
                  {overallBand.toFixed(1)}
                </span>
                <span className="text-[10px] opacity-80">Official Descriptors</span>
              </div>

              {/* 4 Official Criteria Scores */}
              <div className="sm:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  {
                    key: "task_achievement",
                    label: taskType === "task_1" ? "Task Achievement" : "Task Response",
                    score: criteriaScores?.task_achievement ?? overallBand,
                  },
                  {
                    key: "coherence",
                    label: "Coherence & Cohesion",
                    score: criteriaScores?.coherence ?? overallBand,
                  },
                  {
                    key: "lexical",
                    label: "Lexical Resource",
                    score: criteriaScores?.lexical ?? overallBand,
                  },
                  {
                    key: "grammar",
                    label: "Grammatical Accuracy",
                    score: criteriaScores?.grammar ?? overallBand,
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="p-3 rounded-2xl glass-panel flex flex-col justify-between"
                  >
                    <span className="text-[11px] text-muted font-medium line-clamp-1">
                      {item.label}
                    </span>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-xl font-bold font-heading text-foreground">
                        {Number(item.score).toFixed(1)}
                      </span>
                      <span className="text-[10px] text-muted">/ 9.0</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sentence Corrections & Enhancements */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>Examiner Sentence Enhancements ({corrections.length})</span>
                </h3>

                {/* Mobile Language Switcher */}
                <div className="sm:hidden flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-muted" />
                  <select
                    value={selectedLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="py-1 px-2 rounded-lg glass-pill text-[11px] bg-surface text-foreground"
                  >
                    {NATIVE_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {corrections.length === 0 ? (
                <div className="p-4 rounded-2xl glass-panel text-center text-xs text-muted">
                  No critical syntax errors identified. High lexical accuracy maintained.
                </div>
              ) : (
                <div className="space-y-3">
                  {corrections.map((item, idx) => {
                    const localizedText =
                      selectedLanguage !== "English" &&
                      item.localized_explanations?.[selectedLanguage]
                        ? item.localized_explanations[selectedLanguage]
                        : item.explanation_en;

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl glass-panel border border-border/80 flex flex-col gap-2.5 text-xs"
                      >
                        {/* Original vs Improved */}
                        <div className="space-y-1.5">
                          <div className="flex items-start gap-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/15 text-red-500 shrink-0 mt-0.5">
                              ORIGINAL
                            </span>
                            <p className="text-muted line-through decoration-red-500/50">
                              {item.original}
                            </p>
                          </div>

                          <div className="flex items-start gap-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-500 shrink-0 mt-0.5">
                              BAND 8.5+
                            </span>
                            <p className="font-semibold text-foreground">
                              {item.improved}
                            </p>
                          </div>
                        </div>

                        {/* Localized Explanation Box */}
                        <div className="mt-1 p-2.5 rounded-xl bg-surfaceSecondary/70 border border-border flex items-start gap-2">
                          <Languages className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">
                              Why it matters ({selectedLanguage}):
                            </span>
                            <p className="text-[11px] text-foreground/90 mt-0.5 leading-relaxed">
                              {translatingIndex === idx ? (
                                <span className="flex items-center gap-1.5 text-muted">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Translating explanation...
                                </span>
                              ) : (
                                localizedText
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submitted Essay Text */}
            <div>
              <h3 className="text-sm font-bold font-heading text-foreground mb-2">
                Your Submitted Essay
              </h3>
              <div className="p-4 rounded-2xl glass-card border border-border text-xs leading-relaxed font-sans whitespace-pre-wrap text-foreground/90 max-h-56 overflow-y-auto">
                {essayText}
              </div>
            </div>

            {/* Unlocked Model Answer Section */}
            <div className="pt-2">
              <motion.button
                {...tactilePress}
                onClick={handleToggleModelAnswer}
                className="w-full py-3 px-4 rounded-2xl bg-surfaceSecondary border border-border flex items-center justify-between font-heading font-bold text-xs sm:text-sm text-foreground hover:bg-surface transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-accent" />
                  <span>Band 9.0 Official Examiner Model Answer (Unlocked)</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-muted transition-transform duration-200 ${
                    showModelAnswer ? "rotate-180" : ""
                  }`}
                />
              </motion.button>

              <AnimatePresence>
                {showModelAnswer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={iosSpring}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-5 rounded-2xl glass-card border border-accent/25 bg-accent/5 text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre-wrap font-sans">
                      {loadingModelAnswer ? (
                        <div className="flex items-center justify-center py-6 gap-2 text-muted text-xs">
                          <Loader2 className="w-4 h-4 animate-spin text-accent" />
                          <span>Decrypting authorized model answer...</span>
                        </div>
                      ) : (
                        modelAnswer ||
                        "Official model answer unavailable for this test."
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EvaluationReviewModal;
