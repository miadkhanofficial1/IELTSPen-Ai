import { NextResponse } from "next/server";
import { queryOne, parseJson } from "@/lib/db";
import { ensureDatabaseInitialized } from "@/lib/db-init";

export async function GET() {
  try {
    await ensureDatabaseInitialized();
    const settings = await queryOne<any>(
      "SELECT global_announcement, creator_bio FROM system_settings WHERE id = 1"
    );

    return NextResponse.json({
      success: true,
      globalAnnouncement: settings?.global_announcement || null,
      creatorBio: parseJson(settings?.creator_bio, null),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
