import { NextRequest, NextResponse } from "next/server";
import { queryOne, parseJson } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;

    const task = await queryOne<any>(
      "SELECT id, task_type, topic_category, title, prompt_text, chart_data, status, vocabulary_assets, published_at, created_at FROM writing_tasks WHERE id = ?",
      [taskId]
    );

    if (task) {
      return NextResponse.json({
        success: true,
        task: {
          ...task,
          chart_data: parseJson(task.chart_data, null),
          vocabulary_assets: parseJson(task.vocabulary_assets, []),
        },
      });
    }

    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  } catch (error: any) {
    console.error("Error fetching task:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
