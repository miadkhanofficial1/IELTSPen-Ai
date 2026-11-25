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
    username VARCHAR(64) NULL UNIQUE,
    is_profile_public BOOLEAN NOT NULL DEFAULT TRUE,
    bio TEXT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
    native_language VARCHAR(64) NOT NULL DEFAULT 'English',
    merit_score INT NOT NULL DEFAULT 100,
    locked_until DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_username (username),
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

-- 7. FREE ASSET FILES TABLE (Admin-uploaded PDFs, Cheat Sheets, Images & Materials)
CREATE TABLE IF NOT EXISTS free_asset_files (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INT NOT NULL,
    file_url TEXT NOT NULL,
    file_data LONGTEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_asset_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. STUDENT STUDY ASSETS TABLE (Vocabulary, Grammar Rules & Exam Tricks with Native Explanations)
CREATE TABLE IF NOT EXISTS student_study_assets (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    task_id VARCHAR(36) NULL,
    submission_id VARCHAR(36) NULL,
    asset_type ENUM('vocabulary', 'grammar', 'trick') NOT NULL,
    category VARCHAR(100) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    content_en TEXT NOT NULL,
    explanation_native TEXT NULL,
    native_language VARCHAR(64) NULL,
    translations JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_study_assets_type (asset_type),
    INDEX idx_study_assets_user (user_id),
    INDEX idx_study_assets_title (title_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Saved Vocabulary with Spaced Repetition Mastery
CREATE TABLE IF NOT EXISTS saved_vocabulary (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    word VARCHAR(191) NOT NULL,
    meaning_en TEXT NOT NULL,
    meaning_native TEXT NULL,
    example_sentence TEXT NULL,
    topic_category VARCHAR(100) NOT NULL DEFAULT 'General Academic',
    mastery_level INT NOT NULL DEFAULT 1,
    next_review_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_vocab_user (user_id),
    INDEX idx_vocab_user_word (user_id, word),
    INDEX idx_vocab_category (topic_category),
    INDEX idx_vocab_review (next_review_at),
    CONSTRAINT fk_vocab_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Study Calendar Events
CREATE TABLE IF NOT EXISTS study_events (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category ENUM('Study', 'Exam Date', 'To-do', 'Goals') NOT NULL DEFAULT 'Study',
    event_date DATE NOT NULL,
    start_time VARCHAR(10) NULL,
    end_time VARCHAR(10) NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_events_user_date (user_id, event_date),
    CONSTRAINT fk_events_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Daily Reflections & Goals Journal
CREATE TABLE IF NOT EXISTS daily_reflections (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    reflection_date DATE NOT NULL,
    reflection_text TEXT NOT NULL,
    daily_goal TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_reflection_date (user_id, reflection_date),
    INDEX idx_reflections_user (user_id),
    CONSTRAINT fk_reflections_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Authentic Study Articles & Guides
CREATE TABLE IF NOT EXISTS study_articles (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    content_md MEDIUMTEXT NOT NULL,
    read_time_minutes INT NOT NULL DEFAULT 5,
    author VARCHAR(191) NOT NULL DEFAULT 'MD. MIAD IBNA NOOR',
    published_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_articles_category (category),
    INDEX idx_articles_published (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
