# hel-proto-sidenavigation-CLAUDE

HDS SideNavigation demo with realistic Helsinki service content.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Components

| Component | Status |
|-----------|--------|
| SideNavigation | Custom component, requires Drupal adaptation |

## Structure

- Nested navigation tree with expandable sections
- Content updates on selection
- Finnish language

## Drupal Notes

SideNavigation requires custom implementation:
- Use Drupal menu system as data source
- Apply HDS CSS classes via custom theme
- JavaScript for expand/collapse functionality
- Consider HDBT theme patterns

## Changelog

### 2026-01-20: Toggle Button Redesign

Updated SideNavigation toggle button to match hel.fi production:

**Visual Changes:**
- Icon: `IconAngleDown` from HDS (↓ collapsed, ↑ expanded)
- Touch area: 44×44px (transparent background)
- Icon area: 28×28px with `black-5` background, `black-10` on hover
- Focus ring: 3px `black-90` inside 44px touch area

**Animation:**
- 180° clockwise rotation on expand/collapse
- Center pivot point (chevron tip stays centered)
- Background square remains static during rotation
- Spring easing: `cubic-bezier(0.0, 0.0, 0.2, 1)`

**Implementation:**
- Added `.sidenav-toggle-icon` wrapper span for static background
- Inner SVG rotates independently
- Uses HDS color tokens (`--color-black-5`, `--color-black-10`, `--color-black-90`)

**Cleanup:**
- Removed unused `TreeNavigation` component (`TreeNavigation.tsx`, `TreeNavigation.css`)
