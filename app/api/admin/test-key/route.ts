import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const { provider, modelName, apiKey } = await request.json();

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: "Provider and API Key are required" },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    let isSuccess = false;
    let errorDetail = "";

    try {
      if (provider === "gemini") {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${
            modelName || "gemini-1.5-flash"
          }:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: "Hello, reply with 'OK'." }] }],
            }),
          }
        );
        isSuccess = res.ok;
        if (!res.ok) errorDetail = `Gemini returned ${res.status}: ${await res.text()}`;
      } else if (provider === "groq") {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: modelName || "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: "Reply with 'OK'." }],
            max_tokens: 5,
          }),
        });
        isSuccess = res.ok;
        if (!res.ok) errorDetail = `Groq returned ${res.status}: ${await res.text()}`;
      } else if (provider === "openrouter") {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: modelName || "meta-llama/llama-3.3-70b-instruct:free",
            messages: [{ role: "user", content: "Reply with 'OK'." }],
            max_tokens: 5,
          }),
        });
        isSuccess = res.ok;
        if (!res.ok) errorDetail = `OpenRouter returned ${res.status}: ${await res.text()}`;
      } else if (provider === "mistral") {
        const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: modelName || "mistral-small-latest",
            messages: [{ role: "user", content: "Reply with 'OK'." }],
            max_tokens: 5,
          }),
        });
        isSuccess = res.ok;
        if (!res.ok) errorDetail = `Mistral returned ${res.status}: ${await res.text()}`;
      }
    } catch (netErr: any) {
      errorDetail = netErr.message || "Network request failed";
    }

    const latencyMs = Date.now() - startTime;

    if (isSuccess) {
      return NextResponse.json({
        success: true,
        latencyMs,
        message: `Successfully connected to ${provider} in ${latencyMs}ms`,
      });
    } else {
      return NextResponse.json({
        success: false,
        latencyMs,
        error: errorDetail || "Authentication or model connection failed",
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Ping test failed" },
      { status: 500 }
    );
  }
}
