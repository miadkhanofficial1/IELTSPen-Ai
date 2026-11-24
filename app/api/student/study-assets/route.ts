import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { query, execute, parseJson } from "@/lib/db";
import { ensureDatabaseInitialized } from "@/lib/db-init";
import { translateExplanation } from "@/lib/ai-engine";

export async function GET(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestedLang = request.nextUrl.searchParams.get("lang");
    const targetLang = requestedLang || session.nativeLanguage || "English";

    // 1. Fetch all Free Asset Files (Admin Uploaded)
    const files = await query<any>(
      "SELECT id, title, category, description, file_name, file_type, file_size, file_url, created_at FROM free_asset_files ORDER BY created_at DESC"
    );

    // 2. Fetch all Study Assets (harvested from tests or curated)
    const rawStudyAssets = await query<any>(
      `SELECT * FROM student_study_assets 
       WHERE user_id = ? OR user_id IS NULL 
       ORDER BY created_at DESC`,
      [session.userId]
    );

    // 3. Process bilingual translation caching
    const processedAssets = await Promise.all(
      rawStudyAssets.map(async (asset) => {
        const translations = parseJson<Record<string, string>>(asset.translations, {});
        let displayExplanation = asset.content_en;

        if (targetLang === "English") {
          displayExplanation = asset.content_en;
        } else if (translations[targetLang]) {
          displayExplanation = translations[targetLang];
        } else if (asset.native_language === targetLang && asset.explanation_native) {
          displayExplanation = asset.explanation_native;
        } else {
          // Translate on the fly and cache into translations
          try {
            const translated = await translateExplanation(asset.content_en, targetLang);
            if (translated && translated !== asset.content_en) {
              translations[targetLang] = translated;
              displayExplanation = translated;

              // Asynchronously update cached translations in DB
              execute(
                "UPDATE student_study_assets SET translations = ? WHERE id = ?",
                [JSON.stringify(translations), asset.id]
              ).catch((e) => console.warn("Failed to cache translation:", e));
            }
          } catch (e) {
            displayExplanation = asset.explanation_native || asset.content_en;
          }
        }

        return {
          id: asset.id,
          user_id: asset.user_id,
          task_id: asset.task_id,
          submission_id: asset.submission_id,
          asset_type: asset.asset_type,
          category: asset.category,
          title_en: asset.title_en,
          content_en: asset.content_en,
          explanation_native: asset.explanation_native,
          native_language: asset.native_language,
          translations,
          display_explanation: displayExplanation,
          created_at: asset.created_at,
        };
      })
    );

    const vocabulary = processedAssets.filter((a) => a.asset_type === "vocabulary");
    const grammar = processedAssets.filter((a) => a.asset_type === "grammar");
    const tricks = processedAssets.filter((a) => a.asset_type === "trick");

    return NextResponse.json({
      success: true,
      files,
      vocabulary,
      grammar,
      tricks,
      currentLanguage: targetLang,
    });
  } catch (error: any) {
    console.error("Error in /api/student/study-assets GET:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}