export type UserRole = "student" | "admin";
export type TaskType = "task_1" | "task_2";
export type TaskStatus = "draft" | "published";
export type SubmissionStatus = "completed" | "failed_cheat";
export type AppealStatus = "pending" | "approved_restored" | "approved_only" | "dismissed";
export type AiProvider = "gemini" | "groq" | "openrouter" | "mistral";

export interface VocabularyAsset {
  word: string;
  meaning: string;
  example: string;
}

export interface CriteriaScores {
  task_achievement: number; // or task_response for Task 2
  coherence: number;
  lexical: number;
  grammar: number;
}

export interface CorrectionItem {
  original: string;
  improved?: string;
  corrected?: string;
  explanation_en?: string;
  reason?: string;
  localized_explanations?: Record<string, string>;
  explanation_native?: string;
}

export interface CreatorBio {
  name: string;
  role: string;
  location: string;
  github: string;
  linkedin: string;
  portfolio: string;
  email: string;
}

export interface WritingTask {
  id: string;
  task_type: TaskType;
  topic_category: string;
  title: string;
  prompt_text: string;
  chart_data?: any;
  model_answer: string;
  vocabulary_assets: VocabularyAsset[];
  status: TaskStatus;
  published_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Submission {
  id: string;
  user_id: string;
  task_id: string;
  student_essay: string;
  essay_text?: string;
  word_count: number;
  time_spent_seconds?: number;
  paste_count?: number;
  tab_switch_count?: number;
  overall_band: number;
  criteria_scores: CriteriaScores;
  corrections: CorrectionItem[];
  examiner_feedback?: string | null;
  feedback_native_translation?: string | null;
  status: SubmissionStatus;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  native_language: string;
  merit_score: number;
  locked_until: string | null;
  created_at: string;
  updated_at?: string;
}

export interface SystemSettings {
  id: number;
  platform_name: string;
  global_announcement: string | null;
  daily_ai_limit_per_user: number;
  emergency_read_only_mode: boolean;
  active_ai_provider: AiProvider;
  created_at: string;
  updated_at: string;
}

export interface AiApiKeyRecord {
  id: string;
  provider: AiProvider;
  model_name?: string;
  api_key_masked?: string;
  api_key: string;
  is_active: boolean;
  priority: number;
  call_count?: number;
  daily_usage_count?: number;
  error_count?: number;
  last_used_at: string | null;
  created_at: string;
}

export interface UnlockAppeal {
  id: string;
  user_id: string;
  message: string;
  status: AppealStatus;
  admin_notes?: string | null;
  resolved_at?: string | null;
  created_at: string;
  user_name?: string;
  user_email?: string;
  user_merit?: number;
  user_locked_until?: string | null;
}

export interface FreeAssetFile {
  id: string;
  title: string;
  category: string;
  description?: string | null;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  file_data?: string | null;
  created_at: string;
}

export type StudyAssetType = "vocabulary" | "grammar" | "trick";

export interface StudyAsset {
  id: string;
  user_id?: string | null;
  task_id?: string | null;
  submission_id?: string | null;
  asset_type: StudyAssetType;
  category: string;
  title_en: string;
  content_en: string;
  example_en?: string | null;
  explanation_en?: string | null;
  explanation_native?: string | null;
  native_language?: string | null;
  translations?: Record<string, string> | null;
  display_explanation?: string;
  created_at: string;
}
