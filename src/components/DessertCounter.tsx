"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function DessertCounter({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const limit = 1;

  async function inc() {
    const res = await fetch("/api/dessert/inc", { method: "POST" });
    if (res.ok) {
      const j = await res.json();
      setCount(j.count);
    }
  }

  const overLimit = count > limit;
  return (
    <div className="flex items-center justify-between rounded-xl border border-sage-100 bg-white px-4 py-3">
      <div>
        <div className="text-base font-medium">Desserts this week</div>
        <div className={overLimit ? "text-sm text-rose-600" : "text-sm text-muted"}>
          {count} / {limit}{overLimit ? " — over the limit" : ""}
        </div>
      </div>
      <Button onClick={inc} variant="ghost">+1</Button>
    </div>
  );
}
