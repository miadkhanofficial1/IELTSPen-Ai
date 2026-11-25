import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "@/lib/auth";
import { query, execute } from "@/lib/db";
import { ensureDatabaseInitialized } from "@/lib/db-init";
import { StudyArticle } from "@/lib/types";

// GET: Fetch all articles for Admin Studio
export async function GET() {
  try {
    await ensureDatabaseInitialized();
    const session = await getServerSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const articles = await query<StudyArticle>(
      `SELECT * FROM study_articles ORDER BY created_at DESC`
    );

    return NextResponse.json({ success: true, articles });
  } catch (error: any) {
    console.error("Error in /api/admin/articles GET:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create a new study article
export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    const session = await getServerSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, category, content_md, read_time_minutes, author } = body;

    if (!title || !content_md) {
      return NextResponse.json(
        { error: "Title and markdown content are required." },
        { status: 400 }
      );
    }

    const newId = crypto.randomUUID();
    const cleanTitle = String(title).trim();
    const cleanCategory = category ? String(category).trim() : "Band 9 Strategies";
    const cleanContent = String(content_md).trim();
    const cleanReadTime = Number(read_time_minutes) || 5;
    const cleanAuthor = author ? String(author).trim() : "MD. MIAD IBNA NOOR";

    await execute(
      `INSERT INTO study_articles (id, title, category, content_md, read_time_minutes, author, published_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [newId, cleanTitle, cleanCategory, cleanContent, cleanReadTime, cleanAuthor]
    );

    return NextResponse.json({
      success: true,
      article: {
        id: newId,
        title: cleanTitle,
        category: cleanCategory,
        content_md: cleanContent,
        read_time_minutes: cleanReadTime,
        author: cleanAuthor,
        published_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error in /api/admin/articles POST:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Delete an article
export async function DELETE(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    const session = await getServerSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Article ID is required." }, { status: 400 });
    }

    await execute(`DELETE FROM study_articles WHERE id = ?`, [id]);

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error("Error in /api/admin/articles DELETE:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
