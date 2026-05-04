// Date helpers in the user's local timezone (set via TZ env var; default America/New_York).

const TZ = process.env.TZ || "America/New_York";

export function todayLocal(): string {
  return formatYMD(new Date());
}

export function formatYMD(d: Date): string {
  // Renders YYYY-MM-DD in the configured TZ.
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(d);
}

export function isoWeek(dateYMD: string): string {
  // Returns YYYY-Www for the given local date string.
  const [y, m, day] = dateYMD.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, day));
  // ISO week algorithm
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((+d - +yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export function addDays(dateYMD: string, n: number): string {
  const [y, m, day] = dateYMD.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, day));
  d.setUTCDate(d.getUTCDate() + n);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function dayNumberInChallenge(start: string, today: string): number {
  // 1-indexed: the challenge start date is day 1.
  const [ys, ms, ds] = start.split("-").map(Number);
  const [yt, mt, dt] = today.split("-").map(Number);
  const a = Date.UTC(ys, ms - 1, ds);
  const b = Date.UTC(yt, mt - 1, dt);
  const diff = Math.floor((b - a) / 86400000);
  return diff + 1;
}

export function rangeYMD(start: string, count: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(addDays(start, i));
  return out;
}

export function prettyDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
