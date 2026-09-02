# FOYSAL IT OS — Final UX & UI Quality Standard

## Product goal

Build a premium, calm, fast enterprise workspace that remains recognizably FOYSAL IT while being adaptable to every major screen size and workflow type.

## Universal page anatomy

```text
Global Header
  ├─ Workspace switcher
  ├─ Global search / command palette
  ├─ NOVA entry
  ├─ Notifications
  └─ Profile

App Navigation
  ├─ Dashboard
  ├─ Core workspaces
  ├─ Tools / Centers
  ├─ Reports
  └─ Settings

Page
  ├─ Breadcrumbs
  ├─ Title + description
  ├─ Primary action
  ├─ Context / filters
  ├─ Main task area
  ├─ Supporting information
  └─ Activity / audit where relevant
```

## Design tokens

All UI should consume shared tokens rather than arbitrary values:

- typography scale
- font weights
- spacing scale
- radii
- elevation
- borders
- surfaces
- semantic colors
- focus ring
- motion durations/easing
- breakpoints
- container widths

Tokens should be centralized and named semantically (for example `surface`, `text`, `muted`, `border`, `primary`, `danger`) so themes can evolve without rewriting components.

## Responsive strategy

### Small mobile
- one-column content
- bottom or drawer navigation where appropriate
- sticky primary action only when it improves task completion
- tables become cards or horizontal scroll regions
- toolbars wrap or collapse

### Tablet
- collapsible sidebar
- two-column grids where content supports it
- preserve touch target size

### Desktop
- persistent navigation
- bounded content width
- multi-column dashboards only where information hierarchy supports it

### Large screens
- never stretch text-heavy content indefinitely
- use max-width containers and intentional whitespace

## Interaction standards

- Primary actions are obvious.
- Destructive actions require confirmation when data loss or external side effects are possible.
- Forms preserve entered data after recoverable errors.
- Async actions expose progress and disable duplicate submission.
- Long operations have cancellation or background-job behavior where feasible.
- Toasts supplement, not replace, inline feedback.

## Data-heavy UX

Tables must support, as applicable:

- loading skeleton
- empty state
- search
- filters
- sort
- pagination
- column visibility
- row actions
- bulk actions with confirmation
- mobile fallback

## AI UX

AI must be transparent about state and capability:

`Queued → Planning → Running → Waiting for approval → Completed / Failed`

Never claim a tool call, message, payment, publication, deletion or external update succeeded until the server confirms it.

## Accessibility target

Target WCAG 2.2 AA practices:

- keyboard-complete workflows
- semantic landmarks
- labels and descriptions
- focus visibility and management
- reduced-motion support
- contrast
- non-color status communication
- accessible error messaging

## Performance target

- fast initial navigation
- avoid unnecessary client components
- lazy-load heavy editors/media
- virtualize very large lists
- optimize images
- paginate unbounded data
- minimize duplicate network requests
- keep critical UI usable while secondary data loads

## Visual quality gate

A page is not final until it has been checked at:

- 360px mobile
- 390px mobile
- 768px tablet
- 1024px laptop/tablet landscape
- 1440px desktop
- 1920px large desktop

Also check keyboard navigation, reduced motion, slow network, empty data and permission-denied states.
