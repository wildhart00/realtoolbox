## Goal
Ensure the RealToolbox.ai codebase on GitHub reflects the latest changes in Lovable.

## Background
Lovable has built-in two-way GitHub sync. When connected, edits in Lovable push to GitHub automatically, and pushes to GitHub sync back to Lovable. If sync is not connected or has stalled, the repo will be behind.

## Steps

1. **Check GitHub connection status**
   - Inspect project settings / git configuration to confirm whether a GitHub repo is linked.
   - If no repo is linked, the fix is to connect GitHub in the Lovable editor first.

2. **Verify the local working tree is clean and up to date**
   - Run a read-only git status check to see if there are uncommitted or unpushed changes.
   - Note: I will not run state-changing git commands in plan mode.

3. **If GitHub is connected but out of sync**
   - Trigger a sync / push from Lovable to GitHub.
   - Confirm the commit lands in the linked repository.

4. **If GitHub is not connected**
   - Provide the exact steps to connect: Plus (+) menu → GitHub → Connect project → authorize → create/select repo.
   - Once connected, Lovable will push the current state automatically.

## Outcome
Either confirm the repo is already in sync, or give you the exact next action to connect/trigger sync.

## Notes
- I will not modify app code or run `git push`/`commit` until build mode is active and the plan is approved.
- If you already have a GitHub repo connected, the fastest path is usually a manual sync trigger in the Lovable editor rather than command-line git.