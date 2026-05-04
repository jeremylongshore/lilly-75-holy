"use client";

import { cn } from "@/lib/utils";
import { todayLocal } from "@/lib/date";

type Entry = {
  date: string;
  complete: boolean;
  rules: Record<string, boolean>;
  journal_present: boolean;
};

export function StreakCalendar({ entries, title }: { entries: Entry[]; title?: string }) {
  const today = todayLocal();
  return (
    <div>
      {title && <h2 className="font-serif text-xl text-sage-800 mb-3">{title}</h2>}
      <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5" style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}>
        {entries.map((e, i) => {
          const isFuture = e.date > today;
          const isToday = e.date === today;
          const checks = Object.values(e.rules).filter(Boolean).length;
          const titleText =
            `Day ${i + 1} · ${e.date}` +
            (isFuture ? " · upcoming" : e.complete ? " · complete" : ` · ${checks} checks`);
          return (
            <div
              key={e.date}
              title={titleText}
              className={cn(
                "aspect-square rounded-md flex items-center justify-center text-[10px] font-medium",
                isFuture && "bg-sage-50 text-sage-200",
                !isFuture && e.complete && "bg-sage-600 text-white",
                !isFuture && !e.complete && isToday && "bg-rose-100 text-rose-700 border border-rose-300",
                !isFuture && !e.complete && !isToday && "bg-rose-50 text-rose-300",
              )}
            >
              {i + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
}
