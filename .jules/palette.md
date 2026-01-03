# Palette's Journal 🎨

## Design System & Accessibility Patterns

- **Colors:** Uses CSS variables (`--primary`, `--secondary`, `--bg`, `--text`, `--card-bg`) for easy theming and dark mode support.
- **Radius System:** Uses `--radius-sm` (4px), `--radius-md` (8px), `--radius-lg` (12px), and `--radius-xl` (16px) for consistent corner rounding.
- **Focus System:** Implements `--focus-ring-color`, `--focus-ring-width`, and `--focus-offset` to ensure consistent, accessible focus indicators across all interactive elements (`.btn`, `.card`, `.skip-link`, `footer a`).
- **Typography:** Uses system fonts stack for performance. Implements `text-wrap: balance` for headings and `text-wrap: pretty` for paragraphs to improve readability.
- **Dark Mode:** Native support via `color-scheme: light dark` and CSS variables.
- **Focus States:** `:focus-visible` includes both an outline and a visual "lift" (transform) where appropriate (`.card`) to mimic hover states for keyboard users.
- **Responsiveness:** Mobile-first approach where possible.
- **Selection:** `::selection` uses brand secondary color and white text for better visibility.
- **Skip Links:** A "Skip to main content" link is implemented for keyboard navigation.
- **Print Styles:** Print media query removes navigation and decorations.
- **List Semantics:** Grid layouts use `role="list"` where `ul` styling is removed.
- **Interactive Elements:** Buttons enforce `cursor: pointer` and `font-family: inherit`. Code blocks in error pages are keyboard accessible (`tabindex="0"`).
- **Motion:** `prefers-reduced-motion` disables transitions.
- **Meta:** `theme-color` adapts to light/dark mode preferences.

## Rejected Changes

*(None yet)*
