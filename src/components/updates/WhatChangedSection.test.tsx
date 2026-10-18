import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { WhatChangedSection } from "./WhatChangedSection";
import { FINDER_TASKS, TOOL_NAMES } from "@/lib/updates/taskFinder";
import { readPublicUpdates } from "@/lib/updates/readOnly";
vi.mock("@/lib/updates/readOnly", () => ({ readPublicUpdates: vi.fn() }));
const row = { id: "published-1", vendor: "Vendor", title: "Actual published record", summary: "Recorded summary", source_url: "https://vendor.example/news", source_published_date: "2026-09-01", source_checked_at: "2026-10-01T10:00:00Z", published_at: "2026-10-18T10:00:00Z", evidence_level: "vendor_announced" };
const renderFeed = () => render(<MemoryRouter><WhatChangedSection /></MemoryRouter>);
describe("WhatChangedSection read-only feed", () => {
  beforeEach(() => { localStorage.clear(); vi.mocked(readPublicUpdates).mockReset().mockResolvedValue([]); });
  it("shows loading separately from empty", async () => {
    let resolve: (rows: typeof row[]) => void = () => {};
    vi.mocked(readPublicUpdates).mockImplementation(() => new Promise(r => { resolve = r; }));
    renderFeed();
    expect(screen.getByRole("status")).toHaveTextContent("Loading published updates");
    resolve([]);
    expect(await screen.findByText("No published updates yet.")).toBeInTheDocument();
    expect(screen.queryAllByRole("article")).toHaveLength(0);
  });
  it("errors are unavailable, never empty or sample fallback", async () => {
    vi.mocked(readPublicUpdates).mockRejectedValue(new Error("denied"));
    renderFeed();
    expect(await screen.findByRole("alert")).toHaveTextContent("read failure");
    expect(screen.queryByText("No published updates yet.")).not.toBeInTheDocument();
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    expect(screen.queryByText(/RealAssist/)).not.toBeInTheDocument();
  });
  it("shows only supplied public fields and keeps feed independent of audience", async () => {
    vi.mocked(readPublicUpdates).mockResolvedValue([row]); renderFeed();
    const card = await screen.findByRole("article");
    expect(within(card).getByRole("heading")).toHaveTextContent(row.title);
    expect(within(card).getByText("Source publication")).toBeInTheDocument();
    expect(within(card).getByText("Source checked")).toBeInTheDocument();
    expect(within(card).getByText("Editorial publication")).toBeInTheDocument();
    expect(within(card).queryByText(/Pricing|Possible benefit|For:/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Agent" }));
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(readPublicUpdates).toHaveBeenCalledTimes(1);
  });
  it("keyboard audience selection belongs to finder only", async () => {
    renderFeed(); const both = screen.getByRole("radio", { name: "Both" }); both.focus();
    fireEvent.keyDown(both, { key: "ArrowLeft" });
    await waitFor(() => expect(screen.getByRole("radio", { name: "Agent" })).toHaveAttribute("aria-checked", "true"));
    expect(screen.getByRole("radiogroup")).toHaveAccessibleName("Find tools for");
  });
  it("retains directory task links", () => {
    const published = ["canva", "fireflies-ai", "frontdesk", "gamma", "lovable", "n8n", "perspective-ai", "resimpli", "structurely"];
    FINDER_TASKS.flatMap(t => t.toolSlugs).forEach(s => { expect(published).toContain(s); expect(TOOL_NAMES[s]).toBeTruthy(); });
    renderFeed(); fireEvent.click(screen.getByRole("button", { name: "Respond to new leads by call or text" }));
    expect(screen.getByRole("link", { name: /Structurely/ })).toHaveAttribute("href", "/tools/structurely");
  });
});
