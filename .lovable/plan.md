## What's happening

- Fresh headless Chromium hits `realtoolbox.ai` and the homepage stays put — no errors, no redirects, no navigations. The code as deployed is fine.
- It only blanks in **your logged-in Chrome**, works in **Chrome incognito**. That points at something persisted in your normal Chrome profile — almost certainly a stale value in `localStorage` (most likely the Supabase auth token from an earlier build) that throws during render on hydration.
- The app has **no top-level React ErrorBoundary**, so any throw during render unmounts the whole tree — which matches "appears for a second and then vanishes." That's the real bug worth fixing in code; the specific trigger is a downstream symptom.

## Fix

### 1. Add a global ErrorBoundary (the real fix)

New file `src/components/ErrorBoundary.tsx`: a small class component that catches render errors, logs them to the console with the full stack, and renders a branded fallback ("Something went wrong" + Reload button + a "Clear session and reload" button that wipes `localStorage`/`sessionStorage` before reloading — this gets stuck users unstuck without asking them to open DevTools).

Wrap the app in `src/App.tsx`:

```text
<QueryClientProvider>
  <TooltipProvider>
    <ErrorBoundary>            <-- new
      <BrowserRouter> ... </BrowserRouter>
    </ErrorBoundary>
  </TooltipProvider>
</QueryClientProvider>
```

After this, even if something throws in `AuthProvider`, `SearchProvider`, or any page, users see a message and a recovery button instead of a white screen.

### 2. Capture the real trigger from your Chrome

While I ship the boundary, here's how to grab the actual error so I can fix the root cause too:

1. On `realtoolbox.ai` in your normal Chrome, right-click the page → **Inspect** → **Console** tab.
2. Reload the page. When it blanks, screenshot the first red error line (and the stack under it) and paste it back.

If you'd rather just make it work right now without diagnosing:

- DevTools → **Application** tab → **Storage** → **Clear site data** for `realtoolbox.ai`, then reload. That will remove the stale token/cache that Chrome is holding.
- Or once the ErrorBoundary ships, click its "Clear session and reload" button.

### 3. Not changing anything else

- No page/component rewrites, no route changes, no auth logic changes. Just the boundary + fallback.

## Technical notes

- ErrorBoundary must be a class component (React hooks don't support `componentDidCatch`).
- Place it **inside** `QueryClientProvider`/`TooltipProvider` but **outside** `BrowserRouter` so navigation state isn't required for the fallback to render.
- Log with `console.error(error, errorInfo.componentStack)` so the stack survives in production.
- Fallback uses existing design tokens (`bg-background`, `text-foreground`, gradient button matching the "Start free" CTA) — no new styling system.
- No dependency changes.