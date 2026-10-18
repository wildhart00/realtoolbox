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

  it("preview host shows 6 draft cards, 2 recent", () => {
    renderAt("id-preview--abc.lovable.app");
    expect(screen.getAllByRole("article")).toHaveLength(6);
    expect(screen.getByText(/not approved for publication/i)).toBeInTheDocument();
  });

  it("published/custom host withholds all draft cards", () => {
    renderAt("realtoolbox.ai");
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    expect(screen.getByTestId("no-approved")).toBeInTheDocument();
  });

  it("audience selector is an accessible radio group with arrow-key navigation", () => {
    renderAt("localhost");
    const group = screen.getByRole("radiogroup");
    const radios = within(group).getAllByRole("radio");
    expect(radios.map((r) => r.textContent)).toEqual(["Investor", "Agent", "Both"]);
    expect(screen.getByRole("radio", { name: "Both" })).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByRole("radio", { name: "Agent" }));
    expect(screen.getByRole("radio", { name: "Agent" })).toHaveAttribute("aria-checked", "true");
    // Agent view hides investor-only AppFolio entries.
    expect(screen.queryByText(/AppFolio expands Realm-X/)).not.toBeInTheDocument();
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
