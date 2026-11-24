import bcrypt from "bcryptjs";
import { execute, query, queryOne } from "./db";
import { INITIAL_TASKS } from "./mock-tasks";

let isInitialized = false;
let initPromise: Promise<void> | null = null;

const ADMIN_EMAIL = "miadkhan.official1@gmail.com";
const ADMIN_PASSWORD = "Admin@IELTSPen2026!";
const ADMIN_NAME = "MD. MIAD IBNA NOOR";

export async function ensureDatabaseInitialized(): Promise<void> {
  if (isInitialized) return;

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      // 1. Create tables if not exist
      await execute(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(36) PRIMARY KEY,
          full_name VARCHAR(191) NOT NULL DEFAULT '',
          email VARCHAR(191) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
          native_language VARCHAR(64) NOT NULL DEFAULT 'English',
          merit_score INT NOT NULL DEFAULT 100,
          locked_until DATETIME NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_users_email (email),
          INDEX idx_users_role (role)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await execute(`
        CREATE TABLE IF NOT EXISTS writing_tasks (
          id VARCHAR(36) PRIMARY KEY,
          task_type ENUM('task_1', 'task_2') NOT NULL,
          topic_category VARCHAR(100) NOT NULL,
          title VARCHAR(255) NOT NULL,
          prompt_text TEXT NOT NULL,
          chart_data JSON NULL,
          model_answer MEDIUMTEXT NOT NULL,
          vocabulary_assets JSON NULL,
          status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
          published_at DATETIME NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_tasks_type_status (task_type, status),
          INDEX idx_tasks_category (topic_category)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await execute(`
        CREATE TABLE IF NOT EXISTS submissions (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          task_id VARCHAR(36) NOT NULL,
          essay_text MEDIUMTEXT NOT NULL,
          word_count INT NOT NULL,
          status ENUM('completed', 'failed_cheat') NOT NULL,
          tab_violations INT NOT NULL DEFAULT 0,
          overall_band DECIMAL(3,1) NULL,
          criteria_scores JSON NULL,
          corrections JSON NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_submissions_user (user_id),
          INDEX idx_submissions_task (task_id),
          INDEX idx_submissions_user_task (user_id, task_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await execute(`
        CREATE TABLE IF NOT EXISTS unlock_appeals (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          message VARCHAR(200) NOT NULL,
          status ENUM('pending', 'approved_restored', 'approved_only', 'dismissed') NOT NULL DEFAULT 'pending',
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_appeals_status (status),
          INDEX idx_appeals_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await execute(`
        CREATE TABLE IF NOT EXISTS ai_api_keys (
          id VARCHAR(36) PRIMARY KEY,
          provider ENUM('gemini', 'groq', 'openrouter', 'mistral') NOT NULL,
          model_name VARCHAR(100) NOT NULL,
          api_key TEXT NOT NULL,
          priority INT NOT NULL DEFAULT 1,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          daily_usage_count INT NOT NULL DEFAULT 0,
          last_used_at DATETIME NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_ai_keys_priority (priority, is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await execute(`
        CREATE TABLE IF NOT EXISTS system_settings (
          id INT PRIMARY KEY DEFAULT 1,
          daily_submission_limit INT NOT NULL DEFAULT 3,
          ai_evaluations_paused BOOLEAN NOT NULL DEFAULT FALSE,
          global_announcement TEXT NULL,
          creator_bio JSON NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 2. Seed Default System Settings
      const existingSettings = await queryOne("SELECT id FROM system_settings WHERE id = 1");
      if (!existingSettings) {
        const creatorBio = JSON.stringify({
          name: "MD. MIAD IBNA NOOR",
          role: "Founder, MK.Studio",
          location: "Dhaka, Bangladesh",
          mission:
            "Built IELTSPen Ai to empower IELTS aspirants worldwide with a distraction-free, real-exam writing studio and instant multi-language AI evaluation—making Band 8+ preparation simple and accessible for everyone.",
          github: "https://github.com",
          linkedin: "https://linkedin.com",
          portfolio: "https://behance.net",
          email: ADMIN_EMAIL,
        });

        await execute(
          `INSERT INTO system_settings (id, daily_submission_limit, ai_evaluations_paused, global_announcement, creator_bio)
           VALUES (1, 3, FALSE, NULL, ?)
           ON DUPLICATE KEY UPDATE id = 1`,
          [creatorBio]
        );
      }

      // 3. Seed Default Admin User
      const existingAdmin = await queryOne<{ id: string; role: string }>(
        "SELECT id, role FROM users WHERE email = ?",
        [ADMIN_EMAIL]
      );

      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

      if (!existingAdmin) {
        const adminId = "admin-miad-ibna-noor";
        await execute(
          `INSERT INTO users (id, full_name, email, password_hash, role, native_language, merit_score)
           VALUES (?, ?, ?, ?, 'admin', 'English', 100)`,
          [adminId, ADMIN_NAME, ADMIN_EMAIL, passwordHash]
        );
      } else if (existingAdmin.role !== "admin") {
        await execute(
          "UPDATE users SET role = 'admin', full_name = ? WHERE email = ?",
          [ADMIN_NAME, ADMIN_EMAIL]
        );
      }

      // 4. Seed Initial IELTS Writing Tasks if empty
      const existingTasks = await query<{ count: number }>(
        "SELECT COUNT(*) as count FROM writing_tasks"
      );
      const count = existingTasks[0]?.count || 0;

      if (count === 0 && INITIAL_TASKS.length > 0) {
        for (const task of INITIAL_TASKS) {
          await execute(
            `INSERT INTO writing_tasks (id, task_type, topic_category, title, prompt_text, chart_data, model_answer, vocabulary_assets, status, published_at, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', NOW(), NOW())
             ON DUPLICATE KEY UPDATE title = title`,
            [
              task.id,
              task.task_type,
              task.topic_category,
              task.title,
              task.prompt_text,
              JSON.stringify(task.chart_data),
              task.model_answer,
              JSON.stringify(task.vocabulary_assets),
            ]
          );
        }
      }

      isInitialized = true;
    } catch (err) {
      console.error("Database initialization notice:", err);
      // Don't crash process if database is offline or not yet connected in dev
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}
