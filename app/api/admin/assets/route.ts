import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getServerSession } from "@/lib/auth";
import { query, queryOne, execute } from "@/lib/db";
import { ensureDatabaseInitialized } from "@/lib/db-init";

// GET: List all uploaded study assets
export async function GET() {
  try {
    await ensureDatabaseInitialized();
    const session = await getServerSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const files = await query<any>(
      "SELECT id, title, category, description, file_name, file_type, file_size, file_url, created_at FROM free_asset_files ORDER BY created_at DESC"
    );

    return NextResponse.json({ success: true, files });
  } catch (error: any) {
    console.error("Error in /api/admin/assets GET:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Upload a new study asset file
export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    const session = await getServerSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string | null)?.trim();
    const category = (formData.get("category") as string | null)?.trim() || "Cheat Sheet";
    const description = (formData.get("description") as string | null)?.trim() || "";

    if (!file || !title) {
      return NextResponse.json(
        { error: "File and title are required." },
        { status: 400 }
      );
    }

    // Supported formats: PDF, JPG, PNG, WEBP
    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedMimeTypes.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png|webp)$/i)) {
      return NextResponse.json(
        { error: "Invalid file format. Only PDF, JPG, PNG, and WEBP files are supported." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Limit to 15MB
    if (buffer.length > 15 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 15MB limit." },
        { status: 400 }
      );
    }

    const assetId = crypto.randomUUID();
    const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${Date.now()}_${sanitizedOriginalName}`;

    // 1. Save to local public/uploads/assets directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", "assets");
    if (!fs.existsSync(uploadDir)) {
      await fs.promises.mkdir(uploadDir, { recursive: true });
    }
    const diskPath = path.join(uploadDir, uniqueFileName);
    await fs.promises.writeFile(diskPath, buffer);

    // 2. Base64 fallback string for persistent cloud deployments
    const base64Data = buffer.toString("base64");
    const mimeType = file.type || "application/octet-stream";
    const fileDataUri = `data:${mimeType};base64,${base64Data}`;

    const fileUrl = `/api/assets/file/${assetId}`;

    await execute(
      `INSERT INTO free_asset_files (id, title, category, description, file_name, file_type, file_size, file_url, file_data, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        assetId,
        title,
        category,
        description,
        uniqueFileName,
        mimeType,
        buffer.length,
        fileUrl,
        fileDataUri,
      ]
    );

    const newAsset = {
      id: assetId,
      title,
      category,
      description,
      file_name: uniqueFileName,
      file_type: mimeType,
      file_size: buffer.length,
      file_url: fileUrl,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, asset: newAsset });
  } catch (error: any) {
    console.error("Error in /api/admin/assets POST:", error);
    return NextResponse.json({ error: error.message || "Failed to upload file." }, { status: 500 });
  }
}

// DELETE: Delete asset file
export async function DELETE(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    const session = await getServerSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { assetId } = await request.json();
    if (!assetId) {
      return NextResponse.json({ error: "Asset ID required" }, { status: 400 });
    }

    const asset = await queryOne<{ file_name: string }>(
      "SELECT file_name FROM free_asset_files WHERE id = ?",
      [assetId]
    );

    if (asset) {
      const diskPath = path.join(process.cwd(), "public", "uploads", "assets", asset.file_name);
      if (fs.existsSync(diskPath)) {
        try {
          await fs.promises.unlink(diskPath);
        } catch (e) {
          console.warn("Failed to delete local disk file:", e);
        }
      }
      await execute("DELETE FROM free_asset_files WHERE id = ?", [assetId]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in /api/admin/assets DELETE:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}