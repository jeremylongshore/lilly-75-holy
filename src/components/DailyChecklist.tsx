"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { RULES, DAILY_BOOLEAN_RULES, emptyDailyRules, type DailyRulesState } from "@/lib/rules";

export function DailyChecklist({
  initial,
  onChange,
}: {
  initial: DailyRulesState;
  onChange?: (next: DailyRulesState) => void;
}) {
  const [state, setState] = useState<DailyRulesState>({ ...emptyDailyRules(), ...initial });

  useEffect(() => {
    setState((prev) => ({ ...emptyDailyRules(), ...initial, ...prev }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggle(key: string, next: boolean) {
    const updated = { ...state, [key]: next };
    setState(updated);
    onChange?.(updated);
    await fetch("/api/checkin", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ rules: updated }),
    });
  }

  return (
    <div className="space-y-2">
      {DAILY_BOOLEAN_RULES.map((key) => {
        const rule = RULES.find((r) => r.key === key)!;
        return (
          <Checkbox
            key={key}
            checked={state[key] === true}
            onCheckedChange={(v) => toggle(key, v)}
            label={rule.display}
          />
        );
      })}
    </div>
  );
}
