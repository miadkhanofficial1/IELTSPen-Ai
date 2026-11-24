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

    return new NextResponse("File data not available", { status: 404 });
  } catch (error: any) {
    console.error("Error serving asset file:", error);
    return new NextResponse("Server Error", { status: 500 });
  }
}