"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  LayoutDashboard,
  Box,
  Settings,
  Sparkles,
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
  { label: string; dot: string; badge: string; icon: typeof CircleDot }
> = {
  active: {
    label: "稼働中",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: CircleDot,
  },
  deployed: {
    label: "デプロイ済",
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: Rocket,
  },
  "spec-written": {
    label: "仕様書済",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: FileText,
  },
  building: {
    label: "開発中",
    dot: "bg-orange-500",
    badge: "bg-orange-50 text-orange-700 border border-orange-200",
    icon: Hammer,
  },
  dormant: {
    label: "休眠",
    dot: "bg-gray-400",
    badge: "bg-gray-50 text-gray-500 border border-gray-200",
    icon: Moon,
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  "community-saas": "Community",
  ec: "EC",
  "ai-tool": "AI Tool",
  finance: "Finance",
  productivity: "Productivity",
  utility: "Utility",
  tool: "Tool",
  other: "Other",
};

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/", active: true },
  { icon: Box, label: "Apps", href: "/", active: false },
  { icon: Sparkles, label: "Skills", href: "/skills", active: false },
  { icon: Settings, label: "Settings", href: "/", active: false },
];

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
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-[240px] flex-col bg-[#0F172A] text-white shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-9 h-9 bg-[#4F46E5] rounded-xl flex items-center justify-center">
            <Factory className="w-5 h-5 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold">App Factory</p>
            <p className="text-[11px] text-slate-400">Micro SaaS</p>
          </div>
        </div>

        <nav className="flex-1 px-3 mt-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-1 transition-colors ${
                item.active
                  ? "bg-[#1E293B] text-white font-medium"
                  : "text-slate-400 hover:text-white hover:bg-[#1E293B]/50"
              }`}
            >
              {item.active && (
                <div className="absolute left-0 w-[3px] h-5 bg-[#4F46E5] rounded-r-full" />
              )}
              <item.icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 mx-3 mb-4 bg-[#1E293B] rounded-xl">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">
            Registry
          </p>
          <p className="text-xs text-slate-300">registry.yaml driven</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-semibold text-[#111827]">Dashboard</h1>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              全アプリの稼働状況を一覧
            </p>
          </div>
          <button
            onClick={fetchApps}
            className="p-2.5 rounded-xl bg-[#F0F2F5] hover:bg-[#E5E7EB] transition-colors"
            title="更新"
          >
            <RefreshCw
              className={`w-4 h-4 text-[#6B7280] ${loading ? "animate-spin" : ""}`}
              strokeWidth={1.5}
            />
          </button>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm mb-6">
              {error}
            </div>
          )}

          {/* KPI Summary */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {[
                { label: "TOTAL", value: summary.total, color: "text-[#111827]" },
                { label: "ACTIVE", value: summary.active, color: "text-emerald-600" },
                { label: "DEPLOYED", value: summary.deployed, color: "text-blue-600" },
                { label: "BUILDING", value: summary.building, color: "text-orange-600" },
                { label: "SPEC", value: summary.specWritten, color: "text-amber-600" },
                { label: "DORMANT", value: summary.dormant, color: "text-gray-400" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                >
                  <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p
                    className={`text-[32px] font-bold ${stat.color} mt-1 leading-none tabular-nums`}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Section Label */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#111827]">
              All Products
            </h2>
            <span className="text-xs text-[#9CA3AF]">
              {apps.length} items
            </span>
          </div>

          {/* App Cards Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {apps.map((app) => {
              const statusConf =
                STATUS_CONFIG[app.status] || STATUS_CONFIG.dormant;

              return (
                <div
                  key={app.slug}
                  className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:border-[#C7D2FE] transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Name + Status */}
                      <div className="flex items-center gap-2.5 mb-2">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${statusConf.dot} shrink-0`}
                        />
                        <h3 className="text-base font-semibold text-[#111827] truncate">
                          {app.name}
                        </h3>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConf.badge}`}
                        >
                          {statusConf.label}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#F0F2F5] text-[#6B7280]">
                          {CATEGORY_LABELS[app.category] || app.category}
                        </span>
                        {app.sso_integrated && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-200">
                            SSO
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-[#6B7280] mb-4 line-clamp-2">
                        {app.description}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-[#9CA3AF]">
                        {app.born && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                            {app.born}
                            {app.daysAlive !== null && (
                              <span className="text-[#6B7280] font-medium">
                                ({app.daysAlive}d)
                              </span>
                            )}
                          </span>
                        )}
                        {app.issue && (
                          <a
                            href={`https://github.com/tichinosework-hash/ops/issues/${app.issue}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-[#4F46E5] transition-colors"
                          >
                            <GitBranch className="w-3.5 h-3.5" strokeWidth={1.5} />
                            #{app.issue}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Visit button */}
                    {app.url && (
                      <a
                        href={
                          app.url.startsWith("http")
                            ? app.url
                            : `https://${app.url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 p-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] transition-colors shadow-[0_1px_2px_rgba(79,70,229,0.3)] opacity-0 group-hover:opacity-100"
                      >
                        <ExternalLink className="w-4 h-4 text-white" strokeWidth={1.5} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {apps.length === 0 && !loading && !error && (
            <div className="text-center py-20">
              <Factory className="w-12 h-12 mx-auto mb-3 text-[#D1D5DB]" strokeWidth={1.5} />
              <p className="text-sm text-[#9CA3AF]">まだアプリがありません</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
