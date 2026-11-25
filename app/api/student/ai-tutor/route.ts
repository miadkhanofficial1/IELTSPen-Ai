import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { executeAiCompletion } from "@/lib/ai-engine";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify student is not under active exam room lockdown
    const user = await queryOne<{ locked_until: string | null }>(
      `SELECT locked_until FROM users WHERE id = ?`,
      [session.userId]
    );

    if (user?.locked_until) {
      const lockTime = new Date(user.locked_until).getTime();
      if (lockTime > Date.now()) {
        return NextResponse.json(
          {
            error:
              "Exam Room Lockdown is active. DeepStudy AI Writing Tutor is strictly disabled to preserve exam integrity.",
          },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { message, history, nativeLanguage, mode } = body;

    if (!message || !String(message).trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const targetLang = nativeLanguage || session.nativeLanguage || "English";
    const tutorMode = mode || "general";

    let modeInstruction = "";
    if (tutorMode === "brainstorm") {
      modeInstruction = `Focus specifically on essay idea generation, 2-3 distinct balanced viewpoints, and relevant academic examples for IELTS Task 2.`;
    } else if (tutorMode === "thesis") {
      modeInstruction = `Analyze the student's thesis statement or topic sentence. Provide a direct Band 8.5/9.0 rewrite with clear grammatical stance and no cliché expressions.`;
    } else if (tutorMode === "paraphrase") {
      modeInstruction = `Provide 3 distinct academic paraphrases demonstrating high-level Lexical Resource (Band 8+ collocations, nominalizations, and varied sentence structures).`;
    } else if (tutorMode === "grammar") {
      modeInstruction = `Diagnose grammatical inaccuracies, explain the underlying rule (e.g., conditional, inversion, participle clause), and demonstrate the corrected form.`;
    }

    const systemPrompt = `You are the IELTSPen DeepStudy AI Writing Tutor — an elite Cambridge-certified IELTS examiner and pedagogical mentor.
Your mission is to guide candidates toward achieving Band 8.0+ in IELTS Academic and General Training Writing.

${modeInstruction}

Formatting & Pedagogical Guidelines:
1. Provide structured, authoritative Cambridge examiner advice using clear Markdown headings, bullet points, and bold text.
2. Provide concrete Band 8.0 - 9.0 model sentences and collocations.
3. At the end of your response, always include a designated section titled "💡 Key Takeaway in ${targetLang}" explaining the core concept, error, or vocabulary in ${targetLang} so the candidate grasps the concept deeply.
4. Keep the tone encouraging, intellectual, and actionable. Do not output raw JSON; output formatted Markdown prose.`;

    let conversationContext = "";
    if (Array.isArray(history) && history.length > 0) {
      conversationContext = history
        .slice(-6)
        .map((h: any) => `${h.sender === "user" ? "Student" : "Examiner Tutor"}: ${h.content}`)
        .join("\n\n");
    }

    const userPrompt = conversationContext
      ? `Previous Conversation:\n${conversationContext}\n\nCurrent Student Query:\n${message}\n\nStudent Native Language: ${targetLang}`
      : `Student Query:\n${message}\n\nStudent Native Language: ${targetLang}`;

    const reply = await executeAiCompletion(systemPrompt, userPrompt, false);

    if (!reply) {
      return NextResponse.json(
        {
          error:
            "DeepStudy AI is currently experiencing high demand. Please try asking again in a few moments.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (error: any) {
    console.error("Error in /api/student/ai-tutor POST:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
