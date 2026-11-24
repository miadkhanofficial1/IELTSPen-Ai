export interface WritingTask {
  id: string;
  task_type: "task_1" | "task_2";
  topic_category: string;
  title: string;
  prompt_text: string;
  chart_data: any;
  model_answer: string;
  vocabulary_assets: Array<{ word: string; meaning: string; example: string }>;
  status: "draft" | "published";
  published_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export const INITIAL_TASKS: WritingTask[] = [];
