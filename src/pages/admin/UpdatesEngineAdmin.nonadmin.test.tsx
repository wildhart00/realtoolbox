import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

// Signed-in, NOT admin. Role check result mocked; no real account or network.
const rpc = vi.fn(() => Promise.resolve({ data: false, error: null }));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "member-1" }, loading: false }) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: (...a: unknown[]) => rpc(...(a as [])) } }));
vi.mock("@/components/layout/AppLayout", () => ({ AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));

import AdminLayout from "@/components/admin/AdminLayout";
import UpdatesEngineAdmin from "./UpdatesEngineAdmin";

describe("authenticated non-admin", () => {
  it("is shown Admin only and never sees the simulation", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/updates-engine"]}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="updates-engine" element={<UpdatesEngineAdmin />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText("Admin only")).toBeInTheDocument();
    expect(rpc).toHaveBeenCalledWith("has_role", { _user_id: "member-1", _role: "admin" });
    expect(screen.queryByRole("note")).not.toBeInTheDocument();
  });
});
