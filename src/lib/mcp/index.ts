import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchSkills from "./tools/search-skills";
import getSkill from "./tools/get-skill";
import listIntegrations from "./tools/list-integrations";
import getMyPurchases from "./tools/get-my-purchases";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

// This file is the source of truth for the deployed MCP server:
// mcpPlugin() in vite.config.ts bundles it to supabase/functions/mcp/index.ts at
// build time. Editing anything here changes that committed edge-function
// artifact, so run `npm run build` and commit both together.
//
// Describes the product lineup only — it says nothing about which entitlement
// slug backs which toolbox. The gate itself lives in tools/get-skill.ts and the
// edge function, and is unchanged.
export default defineMcp({
  name: "realtoolbox-mcp",
  title: "RealToolbox.ai",
  version: "0.2.0",
  instructions:
    "Tools for RealToolbox.ai — a curated library of AI skills and integrations for real estate investors and the agents who serve them. Skills are unlocked by one-time Toolbox purchases: the Investor Toolbox (every investor skill), or the Complete Toolbox (every investor skill, plus the Scaling Toolbox free when it releases). Use search_skills to browse the skill library, get_skill to retrieve a specific skill's full content (paid skills require the matching toolbox purchase on the caller's account), list_integrations to browse integration directory entries, and get_my_purchases to check the signed-in user's owned toolboxes.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchSkills, getSkill, listIntegrations, getMyPurchases],
});
