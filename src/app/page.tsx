"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), code: code.trim().toUpperCase() }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j.error || "Could not sign in");
        return;
      }
      router.push("/today");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-b from-cream to-sage-50">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-sage-100 p-8 space-y-6"
      >
        <div className="text-center">
          <h1 className="holy-h text-4xl">75 Holy</h1>
          <p className="text-sm text-muted mt-2">Sign in with your name and 6-character code.</p>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="text-sm text-muted">Your name</span>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              autoCapitalize="words"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted">6-character code</span>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={6}
              minLength={6}
              required
              className="tracking-widest text-center font-mono uppercase"
              inputMode="text"
            />
          </label>
        </div>

        {err && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
            {err}
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={busy}>
          {busy ? "Signing in…" : "Start"}
        </Button>

        <p className="text-xs text-center text-muted">
          No password to remember. If you lose your code, ask Jeremy to send a new one.
        </p>
      </form>
    </main>
  );
}
