export type BudgetUnit = "fetch" | "item" | "draft";

export interface JobBudget {
  limits: Record<BudgetUnit, number>;
  used: Record<BudgetUnit, number>;
}

export function createBudget(limits: Partial<Record<BudgetUnit, number>> = {}): JobBudget {
  return {
    limits: { fetch: 2, item: 25, draft: 20, ...limits },
    used: { fetch: 0, item: 0, draft: 0 },
  };
}

/** Reserve before doing work. Returns false (and reserves nothing) if it would exceed the cap. */
export function reserve(b: JobBudget, unit: BudgetUnit, n = 1): boolean {
  if (n <= 0 || !Number.isFinite(n)) return false;
  if (b.used[unit] + n > b.limits[unit]) return false;
  b.used[unit] += n;
  return true;
}

export function release(b: JobBudget, unit: BudgetUnit, n = 1): void {
  b.used[unit] = Math.max(0, b.used[unit] - n);
}

export function remaining(b: JobBudget, unit: BudgetUnit): number {
  return b.limits[unit] - b.used[unit];
}
