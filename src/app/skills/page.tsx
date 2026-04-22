"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Factory,
  RefreshCw,
  LayoutDashboard,
  Box,
  Settings,
  Sparkles,
  Terminal,
  Server,
} from "lucide-react";

interface SkillEntry {
  name: string;
  week: number;
  week_tool: number;
  week_slash: number;
  week_mac: number;
  week_vps: number;
  all_total: number;
  last_used: string | null;
  week_last_used: string | null;
  installed: boolean;
}

interface CronEntry {
  runbook: string;
  count: number;
}

interface SkillUsagePayload {
  generated_at?: string;
  period_days?: number;
  installed_total?: number;
  used_this_week?: number;
  never_used?: number;
  total_invocations_week?: number;
  mac_invocations_week?: number;
  vps_invocations_week?: number;
  skills?: SkillEntry[];
  vps_cron_runs?: CronEntry[];
  error?: string;
}

type FilterKind = "all" | "used" | "unused" | "never";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export default function SkillsDashboard() {
  const [data, setData] = useState<SkillUsagePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterKind>("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/skill-usage");
      const payload = await res.json();
      if (payload.error) throw new Error(payload.error);
      setData(payload);
      setError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "読み込み失敗");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const skills = data?.skills ?? [];

  const filtered = useMemo(() => {
    const list = [...skills];
    switch (filter) {
      case "used":
        return list.filter((s) => s.week > 0).sort((a, b) => b.week - a.week);
      case "unused":
        return list
          .filter((s) => s.week === 0 && s.all_total > 0)
          .sort((a, b) => {
            const ta = a.last_used ? new Date(a.last_used).getTime() : 0;
            const tb = b.last_used ? new Date(b.last_used).getTime() : 0;
            return tb - ta;
          });
      case "never":
        return list.filter((s) => s.all_total === 0).sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list.sort((a, b) => {
          if (b.week !== a.week) return b.week - a.week;
          if (b.all_total !== a.all_total) return b.all_total - a.all_total;
          return a.name.localeCompare(b.name);
        });
    }
  }, [skills, filter]);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/", active: false },
    { icon: Box, label: "Apps", href: "/", active: false },
    { icon: Sparkles, label: "Skills", href: "/skills", active: true },
    { icon: Settings, label: "Settings", href: "/", active: false },
  ];

  const generatedLabel = data?.generated_at
    ? new Date(data.generated_at).toISOString().replace("T", " ").slice(0, 16) + " UTC"
    : "—";

  return (
    <div className="flex min-h-screen w-full">
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
          {navItems.map((item) => (
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
            Data source
          </p>
          <p className="text-xs text-slate-300">skill-usage.json (weekly)</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-[#E5E7EB] px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-semibold text-[#111827]">Skills</h1>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              過去{data?.period_days ?? 7}日のスキル使用状況 · 生成: {generatedLabel}
            </p>
          </div>
          <button
            onClick={fetchData}
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
          {data && !error && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {[
                { label: "INSTALLED", value: data.installed_total ?? 0, color: "text-[#111827]" },
                { label: "USED (7d)", value: data.used_this_week ?? 0, color: "text-emerald-600" },
                {
                  label: "INVOCATIONS",
                  value: data.total_invocations_week ?? 0,
                  color: "text-indigo-600",
                },
                { label: "MAC", value: data.mac_invocations_week ?? 0, color: "text-blue-600" },
                { label: "VPS", value: data.vps_invocations_week ?? 0, color: "text-orange-600" },
                {
                  label: "NEVER USED",
                  value: data.never_used ?? 0,
                  color: "text-gray-400",
                },
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

          {/* VPS Cron Jobs */}
          {data && (data.vps_cron_runs?.length ?? 0) > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Server className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
                <h2 className="text-sm font-semibold text-[#111827]">
                  VPS cron ジョブ実行回数（7日）
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {data.vps_cron_runs!.map((job) => (
                  <div
                    key={job.runbook}
                    className="bg-white border border-[#E5E7EB] rounded-2xl px-4 py-3"
                  >
                    <p className="text-xs text-[#6B7280] truncate font-mono">{job.runbook}</p>
                    <p className="text-2xl font-bold text-[#111827] tabular-nums mt-1">
                      {job.count}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-4">
            {(
              [
                { key: "all", label: "全スキル" },
                { key: "used", label: "今週使用" },
                { key: "unused", label: "今週未使用（過去あり）" },
                { key: "never", label: "一度も未使用" },
              ] as { key: FilterKind; label: string }[]
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === t.key
                    ? "bg-[#4F46E5] text-white"
                    : "bg-[#F0F2F5] text-[#6B7280] hover:bg-[#E5E7EB]"
                }`}
              >
                {t.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-[#9CA3AF]">{filtered.length} items</span>
          </div>

          {/* Skill table */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB]">
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      スキル
                    </th>
                    <th className="text-right px-3 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      今週
                    </th>
                    <th className="text-right px-3 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      Tool
                    </th>
                    <th className="text-right px-3 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      Slash
                    </th>
                    <th className="text-right px-3 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      Mac
                    </th>
                    <th className="text-right px-3 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      VPS
                    </th>
                    <th className="text-right px-3 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      累計
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      最終使用
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => {
                    const isNever = s.all_total === 0;
                    const isActive = s.week > 0;
                    return (
                      <tr
                        key={s.name}
                        className="border-b border-[#F0F2F5] last:border-0 hover:bg-[#F8F9FB] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActive
                                  ? "bg-emerald-500"
                                  : isNever
                                    ? "bg-gray-300"
                                    : "bg-amber-400"
                              }`}
                            />
                            <code className="text-[13px] font-mono text-[#111827]">{s.name}</code>
                          </div>
                        </td>
                        <td
                          className={`text-right px-3 py-3 tabular-nums ${
                            isActive ? "text-[#111827] font-semibold" : "text-[#D1D5DB]"
                          }`}
                        >
                          {s.week}
                        </td>
                        <td className="text-right px-3 py-3 tabular-nums text-[#6B7280]">
                          {s.week_tool || ""}
                        </td>
                        <td className="text-right px-3 py-3 tabular-nums text-[#6B7280]">
                          {s.week_slash || ""}
                        </td>
                        <td className="text-right px-3 py-3 tabular-nums text-[#6B7280]">
                          {s.week_mac || ""}
                        </td>
                        <td className="text-right px-3 py-3 tabular-nums text-[#6B7280]">
                          {s.week_vps || ""}
                        </td>
                        <td
                          className={`text-right px-3 py-3 tabular-nums ${
                            s.all_total > 0 ? "text-[#111827]" : "text-[#D1D5DB]"
                          }`}
                        >
                          {s.all_total}
                        </td>
                        <td className="text-right px-4 py-3 tabular-nums text-[#6B7280] text-xs">
                          {formatDate(s.last_used)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="py-12 text-center">
                <Terminal className="w-10 h-10 mx-auto mb-2 text-[#D1D5DB]" strokeWidth={1.5} />
                <p className="text-sm text-[#9CA3AF]">該当スキルなし</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
