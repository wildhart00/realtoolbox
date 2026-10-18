import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { WhatChangedSection } from "./WhatChangedSection";
import { FINDER_TASKS, TOOL_NAMES } from "@/lib/updates/taskFinder";

const NOW = new Date("2026-10-18T15:30:00Z");
const renderAt = (hostname: string) =>
  render(
    <MemoryRouter>
      <WhatChangedSection now={NOW} hostname={hostname} />
    </MemoryRouter>,
  );

// Published tool slugs returned by read-only query on 2026-10-18.
const PUBLISHED = ["canva", "fireflies-ai", "frontdesk", "gamma", "lovable", "n8n", "perspective-ai", "resimpli", "structurely"];

describe("WhatChangedSection", () => {
  beforeEach(() => localStorage.clear());

  it("on Oct 18 2026 the exact preview host shows 2 recent and 4 background cards", () => {
    renderAt("id-preview--18ef1731-b3fc-4af0-b00d-4c953677cd01.lovable.app");
    const articles = screen.getAllByRole("article");
    const finder = screen.getByRole("heading", { name: "Find a tool by task" });
    const bgHeading = screen.getByText(/Background — earlier announcements/);
    const before = articles.filter((a) => a.compareDocumentPosition(finder) & Node.DOCUMENT_POSITION_FOLLOWING);
    const after = articles.filter((a) => bgHeading.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(before).toHaveLength(2);
    expect(after).toHaveLength(4);
    expect(within(before[0]).getByRole("heading").textContent).toMatch(/Realtor.com adds RealAssist/);
    expect(within(before[1]).getByRole("heading").textContent).toMatch(/AppFolio expands Realm-X/);
    expect(screen.getByText(/not approved for publication/i)).toBeInTheDocument();
  });

  it("published/custom host withholds all draft cards", () => {
    renderAt("realtoolbox.ai");
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    expect(screen.getByTestId("no-approved")).toBeInTheDocument();
  });

  it("ArrowLeft keyboard event moves focus and selection and filters cards", async () => {
    renderAt("localhost");
    const group = screen.getByRole("radiogroup");
    expect(within(group).getAllByRole("radio").map((r) => r.textContent)).toEqual(["Investor", "Agent", "Both"]);
    const both = screen.getByRole("radio", { name: "Both" });
    expect(both).toHaveAttribute("aria-checked", "true");
    both.focus();
    expect(document.activeElement).toBe(both);
    fireEvent.keyDown(both, { key: "ArrowLeft" });
    const agent = screen.getByRole("radio", { name: "Agent" });
    await waitFor(() => expect(document.activeElement).toBe(agent));
    await waitFor(() => expect(agent).toHaveAttribute("aria-checked", "true"));
    expect(both).toHaveAttribute("aria-checked", "false");
    // Agent filter: investor-only AppFolio entries gone, 3 agent-relevant background + 1 recent remain.
    expect(screen.queryByText(/AppFolio expands Realm-X/)).not.toBeInTheDocument();
    expect(screen.queryByText(/AppFolio announces AI invoice/)).not.toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(4);
  });

  it("task finder sits above background cards", () => {
    renderAt("localhost");
    const finder = screen.getByRole("heading", { name: "Find a tool by task" });
    const bg = screen.getByText(/Background — earlier announcements/);
    expect(finder.compareDocumentPosition(bg) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("finder links only to published tools", () => {
    const used = new Set(FINDER_TASKS.flatMap((t) => t.toolSlugs));
    used.forEach((s) => {
      expect(PUBLISHED).toContain(s);
      expect(TOOL_NAMES[s]).toBeTruthy();
    });
  });

  it("selecting a task shows its tool links", () => {
    renderAt("localhost");
    fireEvent.click(screen.getByRole("button", { name: "Respond to new leads by call or text" }));
    expect(screen.getByRole("link", { name: /Structurely/ })).toHaveAttribute("href", "/tools/structurely");
  });
});
