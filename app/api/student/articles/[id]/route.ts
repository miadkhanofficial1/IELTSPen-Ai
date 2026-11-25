import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { ensureDatabaseInitialized } from "@/lib/db-init";
import { StudyArticle } from "@/lib/types";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    await ensureDatabaseInitialized();
    const resolvedParams = await Promise.resolve(context.params);
    const articleId = resolvedParams.id;

    if (!articleId) {
      return NextResponse.json({ error: "Article ID is required." }, { status: 400 });
    }

    const article = await queryOne<StudyArticle>(
      `SELECT * FROM study_articles WHERE id = ? AND published_at IS NOT NULL`,
      [articleId]
    );

    if (!article) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, article });
  } catch (error: any) {
    console.error("Error in /api/student/articles/[id] GET:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
