Fix newsletter card width

The "New tools, every month" newsletter card at the bottom of the homepage currently has `maxWidth: 540px`, which makes it look small and off-center beneath the wider 1200px tool grid above it.

Change the card's `maxWidth` from 540 → 640px so it has more visual presence and feels properly centered under the grid.

Single file change: `src/components/home/NewsletterCard.tsx` line 28.