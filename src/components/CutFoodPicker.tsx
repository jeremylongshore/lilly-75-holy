"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function CutFoodPicker({ initial }: { initial: string | null }) {
  const [value, setValue] = useState(initial ?? "");
  const [saved, setSaved] = useState<boolean>(!!initial);
  const [busy, setBusy] = useState(false);

  if (saved) {
    return (
      <div className="rounded-xl bg-sage-50 border border-sage-200 px-4 py-3">
        <div className="text-sm text-sage-800">
          You&apos;re cutting <strong className="font-semibold">{value}</strong> for 75 days.
        </div>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/cut-food", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cut_food_item: value.trim() }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <p className="text-sm text-muted">
        Pick the one food item you&apos;re cutting for the full 75 days. (Examples: soda, fast food, candy, fried food.)
      </p>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. soda"
          autoCapitalize="none"
        />
        <Button type="submit" disabled={busy || !value.trim()}>Save</Button>
      </div>
    </form>
  );
}
