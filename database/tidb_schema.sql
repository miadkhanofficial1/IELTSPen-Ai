-- ==============================================================================
-- IELTSPen Ai — TiDB Serverless Cloud (MySQL 8.0) Database Schema
-- Slogan: "WRITE SMARTER. SCORE HIGHER."
-- Founder: MD. MIAD IBNA NOOR • MK.Studio
-- ==============================================================================

-- 1. USERS TABLE (Self-hosted authentication & merit tracking)
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

-- 2. WRITING TASKS TABLE (Task 1 Academic Charts & Task 2 Essays)
CREATE TABLE IF NOT EXISTS writing_tasks (
    id VARCHAR(36) PRIMARY KEY,
    task_type ENUM('task_1', 'task_2') NOT NULL,
    topic_category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    prompt_text TEXT NOT NULL,
    chart_data JSON NULL, -- Recharts dataset for Bar, Line, Pie
    model_answer MEDIUMTEXT NOT NULL, -- Protected from students until completion
    vocabulary_assets JSON NULL, -- Topic Vocabulary & Collocations [{ word, meaning, example }]
    status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    published_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tasks_type_status (task_type, status),
    INDEX idx_tasks_category (topic_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. SUBMISSIONS TABLE (Exam essays, cheat penalties, Band scores & AI criteria)
CREATE TABLE IF NOT EXISTS submissions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    task_id VARCHAR(36) NOT NULL,
    essay_text MEDIUMTEXT NOT NULL,
    word_count INT NOT NULL,
    status ENUM('completed', 'failed_cheat') NOT NULL,
    tab_violations INT NOT NULL DEFAULT 0,
    overall_band DECIMAL(3,1) NULL,
    criteria_scores JSON NULL, -- { task_achievement, coherence_cohesion, lexical_resource, grammar_accuracy }
    corrections JSON NULL,     -- [{ original, corrected, reason, explanation_native }]
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_submissions_user (user_id),
    INDEX idx_submissions_task (task_id),
    INDEX idx_submissions_user_task (user_id, task_id),
    CONSTRAINT fk_submissions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_submissions_task FOREIGN KEY (task_id) REFERENCES writing_tasks (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. UNLOCK APPEALS TABLE (Student lockout appeals & Admin moderation queue)
CREATE TABLE IF NOT EXISTS unlock_appeals (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    message VARCHAR(200) NOT NULL,
    status ENUM('pending', 'approved_restored', 'approved_only', 'dismissed') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_appeals_status (status),
    INDEX idx_appeals_user (user_id),
    CONSTRAINT fk_appeals_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. AI API KEYS TABLE (Multi-Provider Priority Failover Rotation Engine)
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

-- 6. SYSTEM SETTINGS TABLE (Singleton table for app-wide controls & creator profile)
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY DEFAULT 1,
    daily_submission_limit INT NOT NULL DEFAULT 3,
    ai_evaluations_paused BOOLEAN NOT NULL DEFAULT FALSE,
    global_announcement TEXT NULL,
    creator_bio JSON NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
