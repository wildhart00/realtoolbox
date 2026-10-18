export function safeHttps(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048 || /[\s\\\u0000-\u001f]/.test(value)) return false;
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !u.username && !u.password && !u.port && u.hostname.includes(".") &&
      !u.hostname.endsWith(".local") && !u.hostname.endsWith(".localhost") &&
      !/^[\d.]+$/.test(u.hostname) && !u.hostname.includes(":");
  } catch { return false; }
}
export function validDate(value: unknown, dateOnly = false): value is string {
  if (typeof value !== "string") return false;
  const day = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const dayTime = Date.parse(`${day}T12:00:00Z`);
  if (!Number.isFinite(dayTime) || new Date(dayTime).toISOString().slice(0, 10) !== day) return false;
  if (dateOnly) return value === day;
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value));
}
