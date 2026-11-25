import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ensureDatabaseInitialized } from "@/lib/db-init";
import { StudyArticle } from "@/lib/types";

// GET: Fetch all published study articles
export async function GET() {
  try {
    await ensureDatabaseInitialized();
    const articles = await query<StudyArticle>(
      `SELECT id, title, category, read_time_minutes, author, published_at, created_at,
              SUBSTRING(content_md, 1, 280) as content_preview
       FROM study_articles 
       WHERE published_at IS NOT NULL 
       ORDER BY published_at DESC, created_at DESC`
    );

    return NextResponse.json({ success: true, articles: articles || [] });
  } catch (error: any) {
    console.error("Error in /api/student/articles GET:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
