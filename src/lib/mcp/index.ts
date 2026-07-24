import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchSkills from "./tools/search-skills";
import getSkill from "./tools/get-skill";
import listIntegrations from "./tools/list-integrations";
import getMySubscription from "./tools/get-my-subscription";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "realtoolbox-mcp",
  title: "RealToolbox.ai",
  version: "0.1.0",
  instructions:
    "Tools for RealToolbox.ai — a curated library of AI skills and integrations for real estate investors and pros. Use search_skills to browse the skill library, get_skill to retrieve a specific skill's full content (paid skills require an active All-Access subscription on the caller's account), list_integrations to browse MCP/integration directory entries, and get_my_subscription to check the signed-in user's membership.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchSkills, getSkill, listIntegrations, getMySubscription],
});
