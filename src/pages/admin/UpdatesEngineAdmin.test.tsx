import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import UpdatesEngineAdmin from "./UpdatesEngineAdmin";

vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: null, loading: false }) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: vi.fn() } }));
vi.mock("@/components/layout/AppLayout", () => ({ AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));

import AdminLayout from "@/components/admin/AdminLayout";

describe("UpdatesEngineAdmin (simulation)", () => {
  it("is labeled as a synthetic simulation", () => {
    render(<UpdatesEngineAdmin />);
    expect(screen.getByRole("note")).toHaveTextContent(/synthetic fixtures/i);
    expect(screen.getByRole("note")).toHaveTextContent(/Nothing here fetches sources/);
  });

  it("keeps simulated review controls disabled and disconnected", async () => {
    render(<UpdatesEngineAdmin />);
    fireEvent.mouseDown(screen.getByRole("tab", { name: /Review queue/ }));
    const cards = await screen.findAllByRole("article");
    for (const card of cards) for (const button of within(card).getAllByRole("button")) expect(button).toBeDisabled();
    expect(screen.getByRole("switch")).toBeDisabled();
  });

  it("shows empty state", async () => {
    render(<UpdatesEngineAdmin />);
    fireEvent.click(screen.getByRole("button", { name: "Empty state" }));
    fireEvent.mouseDown(screen.getByRole("tab", { name: /Review queue/ }));
    expect(await screen.findByText("Nothing waiting for review.")).toBeInTheDocument();
  });

  it("is not reachable without admin (existing role gate)", () => {
    render(
      <MemoryRouter initialEntries={["/admin/updates-engine"]}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="updates-engine" element={<UpdatesEngineAdmin />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText("Admin only")).toBeInTheDocument();
    expect(screen.queryByText("Updates engine")).not.toBeInTheDocument();
  });
});
