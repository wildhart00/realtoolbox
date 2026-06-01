## Fix Agent Platforms grid centering

The "Agent Platforms" grid already uses `flex flex-wrap justify-center`, but its trailing row isn't centering reliably. The Skills page uses a slightly different (and proven) wrapper shape, and the Workflows grid below works because its 2-col math is simpler. Align Platforms to the Skills pattern.

### `src/pages/AgentsPage.tsx`

In the Agent Platforms section, change each card wrapper from:

```tsx
<div
  key={a.name}
  className="flex w-full md:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-1.25rem*2)/3)]"
>
  <AgentPlatformCard item={a} />
</div>
```

to match the Skills page exactly:

```tsx
<div key={a.name} className="w-full md:w-[calc((100%-1.25rem*2)/3)]">
  <AgentPlatformCard item={a} />
</div>
```

Changes:
- Drop the intermediate `md:w-[calc((100%-1.25rem)/2)]` 2-col step (Skills goes straight from 1-col → 3-col at md, which is what the working centered grid does).
- Remove `flex` from the wrapper. Card height equalization is already handled by `h-full` on `AgentPlatformCard` plus `items-stretch` (the default) on the parent flex row, so cards still match height without the extra flex wrapper that was interfering with line centering.

The container row stays exactly as-is: `flex flex-wrap justify-center gap-4 md:gap-5`.

### Not changing

- Workflows grid (already centers correctly).
- `AgentPlatformCard` and `WorkflowCard` internals.
- All copy, section order, card styling, and link behavior.
