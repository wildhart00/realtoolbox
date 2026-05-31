## Integrations Fixes

### Code changes
1. **Fix CRM display name** — Update `categoryLabel()` in `IntegrationCard.tsx` to map `crm → "CRM"` so filter pills and card category badges render correctly. Also used by `IntegrationsPage.tsx` filter pills.

### Database changes (data updates only, no schema change)
2. **Fix Gmail setup URL** → `https://support.claude.com/en/articles/10166901-use-google-workspace-connectors`
3. **Fix Google Calendar setup URL** → `https://support.claude.com/en/articles/10166901-use-google-workspace-connectors`
4. **Update Higgsfield**:
   - setup_url → `https://higgsfield.ai/mcp`
   - difficulty → `easy`
   - tagline → assistant-neutral: "Generate AI images and videos from your conversations — works with Claude, ChatGPT, Cursor, and other AI assistants. 30+ models for image and video creation."
5. **Unpublish BatchData** — set `is_published = false` (keep in admin for later)
6. **Add logo URLs** (Google favicon service) to all 5 published integrations:
   - Gmail, Google Calendar, Notion, Zapier, Higgsfield
7. **Review taglines** for assistant-neutral language — all existing taglines are already generic; only Higgsfield gets the update above.

### No schema changes
- No migration needed. All changes are data updates (`UPDATE`) handled via the data-change tool.