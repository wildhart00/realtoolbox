import { describe, it, expect } from "vitest";
import { isPreviewHost, visibleUpdates } from "./releaseGuard";
import { UPDATES } from "./seed";

describe("draft display guard", () => {
  it.each([
    "id-preview--18ef1731-b3fc-4af0-b00d-4c953677cd01.lovable.app",
    "localhost",
    "127.0.0.1",
  ])("allows %s", (h) => expect(isPreviewHost(h)).toBe(true));

  it.each([
    "id-preview--anything.example.com",
    "id-preview--other-project.lovable.app",
    "arbitrary.lovableproject.com",
    "realtoolbox.ai",
    "www.realtoolbox.ai",
    "screenshot-exact-replica-41.lovable.app",
  ])("rejects %s", (h) => {
    expect(isPreviewHost(h)).toBe(false);
    expect(visibleUpdates(UPDATES, h)).toHaveLength(0);
  });
});
