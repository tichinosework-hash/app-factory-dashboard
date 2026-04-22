import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const dynamic = "force-dynamic";

const DATA_PATH =
  process.env.SKILL_USAGE_PATH ||
  resolve(/* turbopackIgnore: true */ process.cwd(), "data", "skill-usage.json");

export async function GET() {
  try {
    const raw = readFileSync(DATA_PATH, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "skill-usage.json 読み込み失敗";
    return NextResponse.json(
      { error: message, skills: [], vps_cron_runs: [] },
      { status: 500 }
    );
  }
}
