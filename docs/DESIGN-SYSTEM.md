# FOYSAL IT OS — Design System

## Goal

The interface should feel like one coherent enterprise operating system, not a collection of unrelated dashboards. Preserve the FOYSAL IT identity while improving hierarchy, spacing, accessibility, consistency and responsiveness.

## Visual hierarchy

1. Primary action: one clear action per section.
2. Secondary actions: visually quieter and grouped.
3. Destructive actions: explicit confirmation and never adjacent to primary actions without spacing.
4. Status: use text + icon, never color alone.
5. Empty states: explain what is missing and provide the next action.

## Layout

- Desktop: persistent left navigation + top utility bar + content canvas.
- Tablet: collapsible navigation and responsive content grid.
- Mobile: compact top bar, drawer navigation and stacked cards.
- Use a consistent max content width and predictable page padding.
- Avoid arbitrary per-page margins.

## Components

Build around reusable primitives:

- Button
- IconButton
- Input
- Select
- Textarea
- Search
- Badge
- StatusBadge
- Card
- StatCard
- DataTable
- Tabs
- Dialog
- Drawer
- Dropdown
- Toast
- Tooltip
- Skeleton
- EmptyState
- ErrorState
- CommandPalette
- Breadcrumbs
- Pagination

## Dashboard cards

A dashboard card should answer one question. Recommended structure:

```text
Title + context
Primary value
Trend / status
Optional explanation
Relevant action
```

Do not overload a single card with unrelated metrics.

## States

Every async feature must design all states:

- loading
- empty
- success
- partial success
- validation error
- permission denied
- provider not configured
- rate limited
- failed / retryable
- offline where relevant

## Accessibility

- Keyboard navigation for every interactive control.
- Visible focus state.
- Semantic HTML.
- Form labels and accessible error messages.
- Dialog focus management.
- Sufficient contrast.
- Do not communicate status with color alone.
- Respect reduced-motion preferences.

## AI UX

AI output must visibly distinguish:

- generating
- queued
- waiting for approval
- completed
- failed
- provider not configured

Show source/context when available. Do not imply that an external action happened unless the backend confirms it.

## Responsive rule

Never solve mobile layouts by simply shrinking desktop UI. Reflow navigation, tables, toolbars and multi-column cards intentionally.

## Consistency rule

If a pattern appears twice, extract a reusable component or documented pattern before creating a third variation.
