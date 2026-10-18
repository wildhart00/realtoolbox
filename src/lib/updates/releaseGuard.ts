import type { UpdateRecord } from "./seed";

/**
 * Release guard. Draft records (editorial_status "draft_needs_human_review") are
 * shown ONLY on local dev and Lovable preview hosts. On any other host — including
 * the published site and custom domains — drafts are withheld, so an accidental
 * publish cannot present unapproved entries as editorially approved.
 */
export function isPreviewHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("id-preview--") ||
    hostname.endsWith(".lovableproject.com")
  );
}

export function visibleUpdates(list: UpdateRecord[], hostname: string): UpdateRecord[] {
  const preview = isPreviewHost(hostname);
  return list.filter((u) => (u.editorial_status as string) === "approved" || preview);
}
