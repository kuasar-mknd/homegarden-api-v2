# Palette's Journal 🎨

## Design System & Accessibility Patterns
- **Colors:** Uses CSS variables (`--primary`, `--secondary`, `--bg`, `--text`, `--card-bg`) for easy theming and dark mode support.
- **Typography:** Uses system fonts stack for performance and native feel.
- **Focus States:** `:focus-visible` should mimic `:hover` styles but with an outline for keyboard accessibility.
- **Responsiveness:** Mobile-first approach where possible, or simple media queries for grid layouts.
- **Selection:** `::selection` uses brand secondary color and white text for better visibility and branding.
- **Skip Links:** A "Skip to main content" link is implemented for keyboard navigation, hidden until focused.
- **Print Styles:** Print media query removes navigation and unnecessary decorations to provide a clean document view.
- **List Semantics:** Grid layouts of items use `ul` and `li` with `role="list"` to provide structure for screen readers.
- **Motion:** `prefers-reduced-motion` disables transitions.
- **Meta:** `theme-color` matches the primary brand color. `og:image` is included for social sharing.

## Rejected Changes
*(None yet)*
