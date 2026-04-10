import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import yaml from "js-yaml";

export const dynamic = "force-dynamic";

interface AppEntry {
  slug: string;
  name: string;
  url: string;
  category: string;
  born: string;
  status: string;
  description: string;
  sso_integrated?: boolean;
  issue?: number;
}

interface Registry {
  apps: AppEntry[];
}

const REGISTRY_PATH =
  process.env.REGISTRY_PATH ||
  resolve(/* turbopackIgnore: true */ process.cwd(), "data", "registry.yaml");

export async function GET() {
  try {
    const raw = readFileSync(REGISTRY_PATH, "utf-8");
    const data = yaml.load(raw) as Registry;
    const apps = (data?.apps || []).map((app) => ({
      ...app,
      daysAlive: app.born
        ? Math.floor(
            (Date.now() - new Date(app.born).getTime()) / (1000 * 60 * 60 * 24)
          )
        : null,
    }));

    const summary = {
      total: apps.length,
      active: apps.filter((a) => a.status === "active").length,
      deployed: apps.filter((a) => a.status === "deployed").length,
      specWritten: apps.filter((a) => a.status === "spec-written").length,
      building: apps.filter((a) => a.status === "building").length,
      dormant: apps.filter((a) => a.status === "dormant").length,
    };

    return NextResponse.json({ apps, summary });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "registry.yaml 読み込み失敗";
    return NextResponse.json(
      { error: message, apps: [], summary: {} },
      { status: 500 }
    );
  }
}
