import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { queryOne } from "@/lib/db";
import { ensureDatabaseInitialized } from "@/lib/db-init";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDatabaseInitialized();
    const assetId = params.id;
    const isDownload = request.nextUrl.searchParams.get("download") === "1";

    const asset = await queryOne<{
      id: string;
      title: string;
      file_name: string;
      file_type: string;
      file_size: number;
      file_data: string | null;
    }>(
      "SELECT id, title, file_name, file_type, file_size, file_data FROM free_asset_files WHERE id = ?",
      [assetId]
    );

    if (!asset) {
      return new NextResponse("File not found", { status: 404 });
    }

    const diskPath = path.join(process.cwd(), "public", "uploads", "assets", asset.file_name);

    // 1. Try local disk
    if (fs.existsSync(diskPath)) {
      const buffer = await fs.promises.readFile(diskPath);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": asset.file_type || "application/octet-stream",
          "Content-Length": buffer.length.toString(),
          "Content-Disposition": `${isDownload ? "attachment" : "inline"}; filename="${encodeURIComponent(
            asset.file_name
          )}"`,
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }

    // 2. Try base64 data stored in database
    if (asset.file_data) {
      const base64Content = asset.file_data.includes(",")
        ? asset.file_data.split(",")[1]
        : asset.file_data;
      const buffer = Buffer.from(base64Content, "base64");
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": asset.file_type || "application/octet-stream",
          "Content-Length": buffer.length.toString(),
          "Content-Disposition": `${isDownload ? "attachment" : "inline"}; filename="${encodeURIComponent(
            asset.file_name
          )}"`,
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }

    // 3. Fallback for starter items: render clean printable HTML document
    const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${asset.title} - IELTSPen Ai</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; background: #fff; line-height: 1.6; max-width: 800px; margin: 0 auto; }
    h1 { color: #E31837; border-bottom: 2px solid #E31837; padding-bottom: 10px; }
    .badge { display: inline-block; background: #fee2e2; color: #E31837; padding: 4px 10px; border-radius: 9999px; font-weight: bold; font-size: 12px; margin-bottom: 20px; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-top: 20px; }
    .footer { margin-top: 50px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="badge">IELTSPen Ai Official Study Material</div>
  <h1>${asset.title}</h1>
  <p><strong>Resource:</strong> ${asset.file_name} &bull; Official Cambridge Standard</p>
  <div class="box">
    <h3>Band 9 Master Principles:</h3>
    <ul>
      <li><strong>Precision:</strong> High-scoring essays prioritize exact syntactic accuracy and appropriate collocations over artificially obscure words.</li>
      <li><strong>Paragraph Architecture:</strong> Each body paragraph must carry a singular controlling idea supported by empirical explanation.</li>
      <li><strong>Task 1 Overview:</strong> Never include raw numbers in the overview; state overarching extremities and trends only.</li>
    </ul>
  </div>
  <div class="footer">
    Published by IELTSPen Ai &bull; Founder: MD. MIAD IBNA NOOR &bull; WRITE SMARTER. SCORE HIGHER.
  </div>
</body>
</html>`;

    return new NextResponse(Buffer.from(fallbackHtml, "utf-8"), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `${isDownload ? "attachment" : "inline"}; filename="${encodeURIComponent(
          asset.file_name.replace(/\.pdf$/i, ".html")
        )}"`,
      },
    });
  } catch (error: any) {
    console.error("Error serving asset file:", error);
    return new NextResponse("Server Error", { status: 500 });
  }
}