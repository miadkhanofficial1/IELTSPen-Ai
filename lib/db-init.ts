import bcrypt from "bcryptjs";
import { execute, query, queryOne } from "./db";

let isInitialized = false;
let initPromise: Promise<void> | null = null;
let lastInitError: Error | null = null;

const ADMIN_EMAIL = "miadkhan.official1@gmail.com";
const ADMIN_PASSWORD = "Admin@IELTSPen2026!";
const ADMIN_NAME = "MD. MIAD IBNA NOOR";

export function getDatabaseInitError(): Error | null {
  return lastInitError;
}

export async function ensureDatabaseInitialized(throwOnError = false): Promise<void> {
  if (isInitialized) return;

  if (initPromise) {
    await initPromise;
    if (throwOnError && lastInitError) throw lastInitError;
    return;
  }

  initPromise = (async () => {
    try {
      lastInitError = null;
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

      await execute(`
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
      `);

      await execute(`
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
      `);

      // 2. Seed Default System Settings
      try {
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
      } catch (err) {
        console.warn("Notice seeding system_settings:", err);
      }

      // 3. Seed Default Admin User
      try {
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
      } catch (err) {
        console.warn("Notice seeding admin user:", err);
      }

      // 6. Seed Starter Study Takeaways (Vocabulary, Grammar, Tricks) if empty
      const existingStudyAssets = await query<{ count: number }>("SELECT COUNT(*) as count FROM student_study_assets");
      if ((existingStudyAssets[0]?.count || 0) === 0) {
        const starterStudyAssets = [
          // Vocabulary
          {
            id: "study-vocab-1",
            asset_type: "vocabulary",
            category: "Academic Collocations",
            title_en: "Exponential Progression",
            content_en: "Extremely rapid or accelerating increase over time.\nExample: 'The subsequent triennium witnessed an exponential progression in renewable energy adoption.'",
            explanation_native: "সময়ের সাথে সাথে খুব দ্রুত বা নাটকীয় হারে বৃদ্ধি পাওয়া। গ্রাফে খাড়া ঊর্ধ্বগতির ক্ষেত্রে এটি ব্যবহৃত হয়।",
            native_language: "বাংলা (Bengali)",
            translations: {
              "বাংলা (Bengali)": "সময়ের সাথে সাথে খুব দ্রুত বা নাটকীয় হারে বৃদ্ধি পাওয়া। গ্রাফে খাড়া ঊর্ধ্বগতির ক্ষেত্রে এটি ব্যবহৃত হয়।",
              "हिन्दी (Hindi)": "समय के साथ अत्यधिक तीव्र या घातीय वृद्धि। चार्ट में तेज वृद्धि के लिए प्रयुक्त।",
            },
          },
          {
            id: "study-vocab-2",
            asset_type: "vocabulary",
            category: "Task 2 Nuance",
            title_en: "Ubiquitous Manifestation",
            content_en: "Present, appearing, or found everywhere in observable reality.\nExample: 'Digital devices have evolved from a luxury into a ubiquitous manifestation of modern society.'",
            explanation_native: "সর্বত্র দৃশ্যমান বা বিদ্যমান বাস্তবতা। আধুনিক প্রযুক্তি বা নগরায়ণ বিষয়ে লেখার দারুণ শব্দ।",
            native_language: "বাংলা (Bengali)",
            translations: {
              "বাংলা (Bengali)": "সর্বত্র দৃশ্যমান বা বিদ্যমান বাস্তবতা। আধুনিক প্রযুক্তি বা নগরায়ণ বিষয়ে লেখার দারুণ শব্দ।",
              "हिन्दी (Hindi)": "सर्वव्यापी प्रकटीकरण — हर जगह मौजूद वास्तविकता।",
            },
          },
          {
            id: "study-vocab-3",
            asset_type: "vocabulary",
            category: "Data Comparison",
            title_en: "Subdued Ascent",
            content_en: "A slow, gentle, or modest rise in numbers or percentages.\nExample: 'In contrast to solar energy, hydroelectric output registered a more subdued ascent of merely 3%.'",
            explanation_native: "খুব মৃদু বা ধীরগতির উত্থান। তীব্র বৃদ্ধির বিপরীতে তুলনামূলক বাক্য রচনায় কার্যকর।",
            native_language: "বাংলা (Bengali)",
            translations: {
              "বাংলা (Bengali)": "খুব মৃদু বা ধীরগতির উত্থান। তীব্র বৃদ্ধির বিপরীতে তুলনামূলক বাক্য রচনায় কার্যকর।",
              "हिन्दी (Hindi)": "धीमी या नियंत्रित वृद्धि। तेज बढ़त के विपरीत तुलना करने के लिए उपयोगी।",
            },
          },

          // Grammar
          {
            id: "study-grammar-1",
            asset_type: "grammar",
            category: "Sentence Variety",
            title_en: "Inversion with Negative Adverbials",
            content_en: "Placing negative adverbs (Seldom, Rarely, Under no circumstances) at sentence head with auxiliary verb before subject.\nExample: 'Seldom do developing nations allocate adequate expenditure to rural connectivity.'",
            explanation_native: "বাক্যের শুরুতে Seldom বা Rarely বসালে প্রশ্নবোধক বাক্যের মতো সাহায্যকারী Verb আগে আনতে হয়। এটি Band 8+ ব্যাকরণিক রেঞ্জ নিশ্চিত করে।",
            native_language: "বাংলা (Bengali)",
            translations: {
              "বাংলা (Bengali)": "বাক্যের শুরুতে Seldom বা Rarely বসালে প্রশ্নবোধক বাক্যের মতো সাহায্যকারী Verb আগে আনতে হয়। এটি Band 8+ ব্যাকরণিক রেঞ্জ নিশ্চিত করে।",
              "हिन्दी (Hindi)": "नकारात्मक क्रियाविशेषण (Seldom, Rarely) वाक्य के शुरू में आने पर सहायक क्रिया कर्ता से पहले आती है।",
            },
          },
          {
            id: "study-grammar-2",
            asset_type: "grammar",
            category: "Punctuation & Cohesion",
            title_en: "Conjunctive Adverb Semicolon Rule",
            content_en: "Join two independent clauses with semicolon (;) followed by conjunctive adverb (however, furthermore, consequently) and a comma.\nExample: 'The legislation passed; however, municipal enforcement remained inconsistent.'",
            explanation_native: "দুটি পূর্ণ বাক্যকে however বা furthermore দিয়ে যুক্ত করতে হলে আগে সেমিকোলন (;) এবং পরে কমা (,) দিতে হবে। সাধারণ কমা বসালে Comma Splice ভুল হয়।",
            native_language: "বাংলা (Bengali)",
            translations: {
              "বাংলা (Bengali)": "দুটি পূর্ণ বাক্যকে however বা furthermore দিয়ে যুক্ত করতে হলে আগে সেমিকোলন (;) এবং পরে কমা (,) দিতে হবে। সাধারণ কমা বসালে Comma Splice ভুল হয়।",
              "हिन्दी (Hindi)": "दो स्वतंत्र उपवाक्यों को जोड़ने के लिए semicolon (;) और फिर अल्पविराम (,) का प्रयोग करें ताकि comma splice से बचा जा सके।",
            },
          },
          {
            id: "study-grammar-3",
            asset_type: "grammar",
            category: "Complex Structures",
            title_en: "Reduced Relative Clauses (-ing / -ed)",
            content_en: "Condense wordy relative clauses by dropping relative pronoun and auxiliary verb.\nExample: 'Figures published by the bureau (instead of which were published) indicate a stark disparity.'",
            explanation_native: "Relative pronoun (which was/who are) বাদ দিয়ে সরাসরি Verb-এর past participle বা ing রূপ ব্যবহার করে বাক্যকে আরও পেশাদার ও সংক্ষিপ্ত করা।",
            native_language: "বাংলা (Bengali)",
            translations: {
              "বাংলা (Bengali)": "Relative pronoun (which was/who are) বাদ দিয়ে সরাসরি Verb-এর past participle বা ing রূপ ব্যবহার করে বাক্যকে আরও পেশাদার ও সংক্ষিপ্ত করা।",
              "हिन्दी (Hindi)": "Relative clause को छोटा करके अधिक संक्षिप्त और उच्च-स्तरीय अकादমিক वाक्य बनाएं।",
            },
          },

          // Exam Tricks
          {
            id: "study-trick-1",
            asset_type: "trick",
            category: "Task 1 Overview Secret",
            title_en: "The Dual-Anchor Rule for Band 8+ Overview",
            content_en: "Never write an Overview with only 1 point. Always report: (1) The highest/lowest extremity, and (2) The most significant trend of change. Never quote data numbers in the Overview paragraph.",
            explanation_native: "ওভারভিউতে কখনোই কাঁচা সংখ্যা (যেমন ২০%, ৫০০ জন) লিখবেন না। সর্বদা দুটি প্রধান বিষয় তুলে ধরুন: সবচেয়ে বড়/ছোট পয়েন্ট এবং সামগ্রিক গতিবিধি। সংখ্যা ছাড়াই ওভারভিউ Band 8 দেয়।",
            native_language: "বাংলা (Bengali)",
            translations: {
              "বাংলা (Bengali)": "ওভারভিউতে কখনোই কাঁচা সংখ্যা (যেমন ২০%, ৫০০ জন) লিখবেন না। সর্বদা দুটি প্রধান বিষয় তুলে ধরুন: সবচেয়ে বড়/ছোট পয়েন্ট এবং সামগ্রিক গতিবিধি। সংখ্যা ছাড়াই ওভারভিউ Band 8 দেয়।",
              "हिन्दी (Hindi)": "Overview में कभी भी वास्तविक आंकड़े न लिखें। हमेशा दो मुख्य प्रवृत्तियां (उच्चतम बिंदु और समग्र बदलाव) बिना संख्या के प्रस्तुत करें।",
            },
          },
          {
            id: "study-trick-2",
            asset_type: "trick",
            category: "Task 2 Essay Strategy",
            title_en: "The Immediate Thesis Rule",
            content_en: "State your direct position in the very last sentence of your introduction. An essay that delays its opinion until the conclusion cannot exceed Band 6.0 in Task Response.",
            explanation_native: "ভূমিকার শেষ লাইনেই আপনার স্পষ্ট অভিমত (Thesis Statement) জানিয়ে দিন। মতামত উপসংহার পর্যন্ত ঝুলিয়ে রাখলে Task Response-এ কখনই ৭ বা ৮ পাওয়া সম্ভব নয়।",
            native_language: "বাংলা (Bengali)",
            translations: {
              "বাংলা (Bengali)": "ভূমিকার শেষ লাইনেই আপনার স্পষ্ট অভিমত (Thesis Statement) জানিয়ে দিন। মতামত উপসংহার পর্যন্ত ঝুলিয়ে রাখলে Task Response-এ কখনই ৭ বা ৮ পাওয়া সম্ভব নয়।",
              "हिन्दी (Hindi)": "प्रस्तावना की अंतिम पंक्ति में ही अपना स्पष्ट दृष्टिकोण घोषित करें। केवल निष्कर्ष में राय देने से बैंड 6 से अधिक नहीं मिल सकता।",
            },
          },
          {
            id: "study-trick-3",
            asset_type: "trick",
            category: "Lexical Resource",
            title_en: "The 3-Synonym Cap for Core Prompts",
            content_en: "Do not invent awkward synonyms for technical words (e.g., changing 'education' to 'pedagogical tutelage'). Paraphrase by changing part of speech instead (educate -> educational -> educator).",
            explanation_native: "অযথা অপ্রাকৃতিক কঠিন শব্দ বানাতে যাবেন না। বরং Part of Speech পরিবর্তন করুন (যেমন 'pollute' থেকে 'pollution levels' বা 'pollutant emission')। এটি প্রাকৃতিক ও নির্ভুল দেখায়।",
            native_language: "বাংলা (Bengali)",
            translations: {
              "বাংলা (Bengali)": "অযথা অপ্রাকৃতিক কঠিন শব্দ বানাতে যাবেন না। বরং Part of Speech পরিবর্তন করুন (যেমন 'pollute' থেকে 'pollution levels' বা 'pollutant emission')। এটি প্রাকৃতিক ও নির্ভুল দেখায়।",
              "हिन्दी (Hindi)": "अप्राकृतिक जटिल शब्दों से बचें। व्याकरणिक रूप बदलकर (Verb से Noun) स्वाभाविक और सटीक पैराफ्रेसिंग करें।",
            },
          },
        ];

        for (const item of starterStudyAssets) {
          await execute(
            `INSERT INTO student_study_assets (id, user_id, task_id, submission_id, asset_type, category, title_en, content_en, explanation_native, native_language, translations, created_at)
             VALUES (?, NULL, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE title_en = VALUES(title_en)`,
            [
              item.id,
              item.asset_type,
              item.category,
              item.title_en,
              item.content_en,
              item.explanation_native,
              item.native_language,
              JSON.stringify(item.translations),
            ]
          );
        }
      }

      isInitialized = true;
    } catch (err: any) {
      lastInitError = err;
      console.error("Database initialization notice:", err);
      if (throwOnError) throw err;
    } finally {
      initPromise = null;
    }
  })();

  await initPromise;
  if (throwOnError && lastInitError) throw lastInitError;
}
