"use client";

import { useState, useEffect } from "react";
import {
  Factory,
  ExternalLink,
  CircleDot,
  FileText,
  Hammer,
  Rocket,
  Moon,
  RefreshCw,
  GitBranch,
  Calendar,
  Tag,
} from "lucide-react";

interface App {
  slug: string;
  name: string;
  url: string;
  category: string;
  born: string;
  status: string;
  description: string;
  sso_integrated?: boolean;
  issue?: number;
  daysAlive: number | null;
}

interface Summary {
  total: number;
  active: number;
  deployed: number;
  specWritten: number;
  building: number;
  dormant: number;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof CircleDot }
> = {
  active: {
    label: "稼働中",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
    icon: CircleDot,
  },
  deployed: {
    label: "デプロイ済",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
    icon: Rocket,
  },
  "spec-written": {
    label: "仕様書済",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/20",
    icon: FileText,
  },
  building: {
    label: "開発中",
    color: "text-orange-400",
    bg: "bg-orange-400/10 border-orange-400/20",
    icon: Hammer,
  },
  dormant: {
    label: "休眠",
    color: "text-gray-500",
    bg: "bg-gray-500/10 border-gray-500/20",
    icon: Moon,
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  "community-saas": "bg-purple-500/20 text-purple-300",
  ec: "bg-red-500/20 text-red-300",
  "ai-tool": "bg-cyan-500/20 text-cyan-300",
  finance: "bg-emerald-500/20 text-emerald-300",
  productivity: "bg-blue-500/20 text-blue-300",
  utility: "bg-gray-500/20 text-gray-300",
  tool: "bg-gray-500/20 text-gray-300",
  other: "bg-gray-500/20 text-gray-300",
};

export default function Dashboard() {
  const [apps, setApps] = useState<App[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/apps");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setApps(data.apps || []);
      setSummary(data.summary || null);
      setError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "読み込み失敗");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#FF7A1A] rounded-lg flex items-center justify-center">
              <Factory className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">App Factory</h1>
              <p className="text-xs text-gray-500">Micro SaaS Dashboard</p>
            </div>
          </div>
          <button
            onClick={fetchApps}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            title="更新"
          >
            <RefreshCw
              className={`w-4 h-4 text-gray-400 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {[
              { label: "全アプリ", value: summary.total, color: "text-white" },
              {
                label: "稼働中",
                value: summary.active,
                color: "text-green-400",
              },
              {
                label: "デプロイ済",
                value: summary.deployed,
                color: "text-blue-400",
              },
              {
                label: "開発中",
                value: summary.building,
                color: "text-orange-400",
              },
              {
                label: "仕様書済",
                value: summary.specWritten,
                color: "text-yellow-400",
              },
              {
                label: "休眠",
                value: summary.dormant,
                color: "text-gray-500",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center"
              >
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* App Cards */}
        <div className="space-y-4">
          {apps.map((app) => {
            const statusConf = STATUS_CONFIG[app.status] || STATUS_CONFIG.dormant;
            const StatusIcon = statusConf.icon;
            const catColor =
              CATEGORY_COLORS[app.category] || CATEGORY_COLORS.other;

            return (
              <div
                key={app.slug}
                className={`bg-gray-900 border rounded-2xl p-5 transition-all hover:border-gray-600 ${statusConf.bg}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h2 className="text-lg font-bold truncate">
                        {app.name}
                      </h2>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConf.color} bg-gray-800`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConf.label}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${catColor}`}
                      >
                        <Tag className="w-3 h-3 inline mr-1" />
                        {app.category}
                      </span>
                    </div>

                    <p className="text-sm text-gray-400 mb-3">
                      {app.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      {app.born && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {app.born}
                          {app.daysAlive !== null && ` (${app.daysAlive}日)`}
                        </span>
                      )}
                      {app.issue && (
                        <a
                          href={`https://github.com/tichinosework-hash/ops/issues/${app.issue}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-gray-300 transition-colors"
                        >
                          <GitBranch className="w-3 h-3" />#{app.issue}
                        </a>
                      )}
                      {app.sso_integrated && (
                        <span className="text-green-500">SSO連携済</span>
                      )}
                    </div>
                  </div>

                  {app.url && (
                    <a
                      href={
                        app.url.startsWith("http")
                          ? app.url
                          : `https://${app.url}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 p-2.5 rounded-xl bg-[#FF7A1A] hover:bg-[#e56b10] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-white" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {apps.length === 0 && !loading && !error && (
          <div className="text-center py-20 text-gray-500">
            <Factory className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>まだアプリがありません</p>
          </div>
        )}
      </main>

      <footer className="mt-auto border-t border-gray-800 py-4 text-center text-xs text-gray-600">
        App Factory Dashboard — registry.yaml driven
      </footer>
    </div>
  );
}
