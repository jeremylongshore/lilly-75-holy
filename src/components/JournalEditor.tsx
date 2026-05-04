"use client";

import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/Textarea";

export function JournalEditor({ initial }: { initial: string }) {
  const [text, setText] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function onChange(value: string) {
    setText(value);
    setStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await fetch("/api/journal", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ journal: value }),
      });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1200);
    }, 1500);
  }

  return (
    <div>
      <Textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Today, I…"
      />
      <div className="mt-2 text-xs text-muted h-4">
        {status === "saving" && "Saving…"}
        {status === "saved" && "Saved"}
      </div>
    </div>
  );
}
