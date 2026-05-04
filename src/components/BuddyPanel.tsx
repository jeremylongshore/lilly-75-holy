"use client";

import { useEffect, useState } from "react";
import { RULES, DAILY_BOOLEAN_RULES } from "@/lib/rules";
import { Card, CardTitle } from "@/components/ui/Card";

type BuddyData = {
  name: string | null;
  message?: string;
  today_rules?: Record<string, boolean>;
  journal_present?: boolean;
  streak?: number;
  completed_days?: number;
  week_dessert_count?: number;
  cut_food_item?: string | null;
};

export function BuddyPanel() {
  const [data, setData] = useState<BuddyData | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/buddy", { cache: "no-store" });
        if (!res.ok) return;
        const j = (await res.json()) as BuddyData;
        if (!cancelled) setData(j);
      } catch {
        /* offline ok */
      }
    }
    load();
    const t = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  if (!data) {
    return (
      <Card>
        <CardTitle>Buddy</CardTitle>
        <p className="text-sm text-muted">Loading…</p>
      </Card>
    );
  }

  if (!data.name) {
    return (
      <Card>
        <CardTitle>Buddy</CardTitle>
        <p className="text-sm text-muted">{data.message ?? "No buddy yet."}</p>
      </Card>
    );
  }

  const checkedCount = Object.entries(data.today_rules ?? {}).filter(([, v]) => v).length;
  const totalDaily = DAILY_BOOLEAN_RULES.length;

  return (
    <Card>
      <CardTitle>{data.name}&apos;s day</CardTitle>
      <div className="text-sm text-muted mb-3">
        {checkedCount} / {totalDaily} checks · streak {data.streak ?? 0} day{(data.streak ?? 0) === 1 ? "" : "s"}
      </div>
      <ul className="space-y-1.5">
        {DAILY_BOOLEAN_RULES.map((key) => {
          const rule = RULES.find((r) => r.key === key)!;
          const checked = data.today_rules?.[key] === true;
          return (
            <li key={key} className="flex items-center gap-2 text-sm">
              <span
                className={
                  "inline-flex w-5 h-5 rounded-md items-center justify-center text-xs " +
                  (checked
                    ? "bg-sage-600 text-white"
                    : "bg-sage-50 text-sage-300 border border-sage-200")
                }
              >
                {checked ? "✓" : ""}
              </span>
              <span className={checked ? "text-ink" : "text-muted"}>{rule.short}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 pt-3 border-t border-sage-100 text-sm flex items-center justify-between">
        <span>
          Journal:{" "}
          {data.journal_present ? (
            <span className="text-sage-700">written ✓</span>
          ) : (
            <span className="text-muted">not yet</span>
          )}
        </span>
        <span className="text-xs text-muted italic">text private</span>
      </div>
      {data.cut_food_item && (
        <div className="mt-2 text-xs text-muted">
          Cutting: <span className="text-sage-700">{data.cut_food_item}</span>
        </div>
      )}
      <div className="mt-1 text-xs text-muted">
        Desserts this week: {data.week_dessert_count ?? 0} / 1
      </div>
    </Card>
  );
}
