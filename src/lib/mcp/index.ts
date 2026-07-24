import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchSkills from "./tools/search-skills";
import getSkill from "./tools/get-skill";
import listIntegrations from "./tools/list-integrations";
import getMyPurchases from "./tools/get-my-purchases";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "realtoolbox-mcp",
  title: "RealToolbox.ai",
  version: "0.2.0",
  instructions:
    "Tools for RealToolbox.ai — a curated library of AI skills and integrations for real estate investors and pros. Skills are unlocked by one-time Toolbox purchases (Investor Toolbox, Agent Toolbox, or Complete Toolbox — Complete unlocks both). Use search_skills to browse the skill library, get_skill to retrieve a specific skill's full content (paid skills require the matching toolbox purchase on the caller's account), list_integrations to browse integration directory entries, and get_my_purchases to check the signed-in user's owned toolboxes.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchSkills, getSkill, listIntegrations, getMyPurchases],
});
