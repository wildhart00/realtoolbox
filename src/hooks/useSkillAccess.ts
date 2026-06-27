import { useSubscription } from "@/hooks/useSubscription";

export type SkillAccessReason = "free" | "subscribed" | "needs_sub";

export function useSkillAccess(accessLevel: string | null | undefined) {
  const { isActive, loading } = useSubscription();
  const isPaid = accessLevel === "paid";
  if (!isPaid) {
    return { loading, locked: false, reason: "free" as SkillAccessReason, isPaid: false };
  }
  if (isActive) {
    return { loading, locked: false, reason: "subscribed" as SkillAccessReason, isPaid: true };
  }
  return { loading, locked: true, reason: "needs_sub" as SkillAccessReason, isPaid: true };
}
