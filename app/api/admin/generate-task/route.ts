import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { getServerSession } from "@/lib/auth";
import { execute } from "@/lib/db";
import { generateIELTSTask } from "@/lib/ai-engine";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin privileges required" },
        { status: 403 }
      );
    }

    const { taskType, topicCategory, batchCount = 1, customPrompt } = await request.json();

    const count = Math.min(5, Math.max(1, Number(batchCount) || 1));
    const generatedDrafts = [];

    const categories = [
      "Environment",
      "Technology",
      "Education",
      "Health",
      "Work & Economy",
      "Society",
    ];

    for (let i = 0; i < count; i++) {
      const selectedCategory =
        topicCategory === "Random"
          ? categories[Math.floor(Math.random() * categories.length)]
          : topicCategory || "Technology";

      const taskData = await generateIELTSTask(
        taskType || "task_2",
        selectedCategory,
        customPrompt
      );

      const taskId = crypto.randomUUID();

      // Save as draft in writing_tasks in TiDB
      await execute(
        `INSERT INTO writing_tasks (id, task_type, topic_category, title, prompt_text, chart_data, model_answer, vocabulary_assets, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', NOW())`,
        [
          taskId,
          taskData.task_type,
          taskData.topic_category,
          taskData.title,
          taskData.prompt_text,
          JSON.stringify(taskData.chart_data),
          taskData.model_answer,
          JSON.stringify(taskData.vocabulary_assets),
        ]
      );

      generatedDrafts.push({
        id: taskId,
        ...taskData,
        status: "draft",
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      tasks: generatedDrafts,
    });
  } catch (err: any) {
    console.error("Generate Task API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate tasks" },
      { status: 500 }
    );
  }
}
