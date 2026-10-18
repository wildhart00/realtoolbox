import type { UpdateRecord } from "./seed";

/**
 * Draft-display guard (NOT security or authentication — drafts are in the public
 * bundle). Draft records show only on this project's exact preview hostname and
 * local development hosts. Every other host, including the published site and
 * custom domains, withholds drafts so an accidental publish cannot present
 * unapproved entries as editorially approved.
 */
export const DRAFT_DISPLAY_HOSTS: ReadonlySet<string> = new Set([
  "id-preview--18ef1731-b3fc-4af0-b00d-4c953677cd01.lovable.app",
  "localhost",
  "127.0.0.1",
]);

export function isPreviewHost(hostname: string): boolean {
  return DRAFT_DISPLAY_HOSTS.has(hostname);
}

export function visibleUpdates(list: UpdateRecord[], hostname: string): UpdateRecord[] {
  const preview = isPreviewHost(hostname);
  return list.filter((u) => (u.editorial_status as string) === "approved" || preview);
}
