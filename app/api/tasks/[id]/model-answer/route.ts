import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "@/lib/auth";
import { queryOne } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = session.role === "admin";

    // 1. Check if student has a completed submission for this task
    let hasCompleted = false;
    if (!isAdmin) {
      const submission = await queryOne<{ id: string }>(
        "SELECT id FROM submissions WHERE user_id = ? AND task_id = ? AND status = 'completed' LIMIT 1",
        [session.userId, taskId]
      );
      hasCompleted = !!submission;
    }

    if (!isAdmin && !hasCompleted) {
      return NextResponse.json(
        {
          error:
            "Model answer is strictly locked until you complete an authentic test submission for this task.",
        },
        { status: 403 }
      );
    }

    // 2. Fetch model answer from TiDB
    const task = await queryOne<{ model_answer: string; title: string }>(
      "SELECT model_answer, title FROM writing_tasks WHERE id = ?",
      [taskId]
    );

    const modelAnswer = task?.model_answer;

    if (!modelAnswer) {
      return NextResponse.json(
        { error: "Model answer not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      model_answer: modelAnswer || "Model answer not found.",
    });
  } catch (err: any) {
    console.error("Model answer retrieval error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to retrieve model answer." },
      { status: 500 }
    );
  }
}
