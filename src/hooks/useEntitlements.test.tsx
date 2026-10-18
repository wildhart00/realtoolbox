import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

// Mocked: no real account, no network, no writes.
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "u1" }, loading: false }) }));
vi.mock("@/integrations/supabase/client", () => {
  const rows = [{ toolbox_slug: "investor_toolbox", status: "paid", purchased_at: "2026-01-01", stripe_session_id: null }];
  const chain = { select: () => chain, eq: () => Promise.resolve({ data: rows }) };
  const channel = { on: () => channel, subscribe: () => channel };
  return { supabase: { from: () => chain, channel: () => channel, removeChannel: () => {} } };
});

import { useEntitlements } from "./useEntitlements";

describe("lifetime entitlements (mocked)", () => {
  it("investor toolbox purchase unlocks investor skills only", async () => {
    const { result } = renderHook(() => useEntitlements());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.canAccess("investor")).toBe(true);
    expect(result.current.canAccess("agent")).toBe(false);
  });
});
