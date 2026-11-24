import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "@/lib/auth";
import { queryOne, execute, parseJson } from "@/lib/db";
import { translateExplanation } from "@/lib/ai-engine";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { submissionId, correctionIndex, explanationEn, targetLanguage } =
      await request.json();

    if (!explanationEn || !targetLanguage) {
      return NextResponse.json(
        { error: "Missing explanation or target language" },
        { status: 400 }
      );
    }

    const translated = await translateExplanation(explanationEn, targetLanguage);

    // If submissionId is valid and not a local mock, update the database record cache
    if (submissionId && !submissionId.startsWith("local-")) {
      const submission = await queryOne<{ corrections: any }>(
        "SELECT corrections FROM submissions WHERE id = ? AND user_id = ?",
        [submissionId, session.userId]
      );

      if (submission) {
        const corrections = parseJson<any[]>(submission.corrections, []);
        if (Array.isArray(corrections) && corrections[correctionIndex]) {
          corrections[correctionIndex].localized_explanations = {
            ...(corrections[correctionIndex].localized_explanations || {}),
            [targetLanguage]: translated,
          };

          await execute(
            "UPDATE submissions SET corrections = ? WHERE id = ?",
            [JSON.stringify(corrections), submissionId]
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      translated,
      targetLanguage,
    });
  } catch (err: any) {
    console.error("Translation API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to translate explanation" },
      { status: 500 }
    );
  }
}
