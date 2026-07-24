import { useEntitlements, type ToolboxKey, type ToolboxSlug } from "@/hooks/useEntitlements";

export type SkillAccessReason = "free" | "owns_toolbox" | "needs_purchase";

export interface UseSkillAccessInput {
  access_level: string | null | undefined;
  toolbox?: string | null | undefined;
}

export interface UseSkillAccessResult {
  loading: boolean;
  locked: boolean;
  reason: SkillAccessReason;
  isPaid: boolean;
  requiredToolbox: ToolboxSlug | null;
}

// Backwards-compatible: accepts either the legacy string signature
// (just access_level) or the new object signature with toolbox.
export function useSkillAccess(
  input: string | null | undefined | UseSkillAccessInput,
): UseSkillAccessResult {
  const normalized: UseSkillAccessInput =
    typeof input === "object" && input !== null
      ? input
      : { access_level: input as string | null | undefined, toolbox: null };

  const { loading, canAccess } = useEntitlements();
  const isPaid = normalized.access_level === "paid";

  if (!isPaid) {
    return { loading, locked: false, reason: "free", isPaid: false, requiredToolbox: null };
  }

  const tb = normalized.toolbox === "investor" || normalized.toolbox === "agent"
    ? (normalized.toolbox as ToolboxKey)
    : null;
  const requiredToolbox: ToolboxSlug | null =
    tb === "investor" ? "investor_toolbox" : tb === "agent" ? "agent_toolbox" : null;

  if (tb && canAccess(tb)) {
    return { loading, locked: false, reason: "owns_toolbox", isPaid: true, requiredToolbox };
  }
  return { loading, locked: true, reason: "needs_purchase", isPaid: true, requiredToolbox };
}
