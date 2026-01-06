# Palette's Journal 🎨

## Design System & Accessibility Patterns

- **Colors:** Uses CSS variables (`--primary`, `--secondary`, `--bg`, `--text`, `--card-bg`) for easy theming and dark mode support.
- **Radius System:** Uses `--radius-sm` (4px), `--radius-md` (8px), `--radius-lg` (12px), and `--radius-xl` (16px) for consistent corner rounding.
- **Focus System:** Standardized focus states use `--focus-ring-color` (primary), `--focus-ring-width` (2px), and `--focus-offset` (2px).
- **Typography:**
  - Uses system fonts stack for performance.
  - Headers use `text-wrap: balance` for better aesthetics.
  - Paragraphs use `text-wrap: pretty` to prevent widows.
- **Interactive Elements:**
  - Buttons and badges enforce `user-select: none`.
  - Buttons enforce `cursor: pointer`.
  - Active buttons use `filter: brightness(0.9)` for visual feedback.
- **Responsiveness:**
  - `viewport-fit=cover` ensures content fills notched displays.
  - `format-detection` prevents unwanted auto-linking of numbers.
- **Accessibility:**
  - `dir="ltr"` explicitly set on html tag.
  - `:focus-visible` uses CSS variables for consistency.
  - `prefers-reduced-motion` enforces `scroll-behavior: auto`.
- **Performance:** `dns-prefetch` used alongside `preconnect` for external assets.
- **Print Styles:** Interactive elements (buttons, badges, skip-links) are hidden in print media.

## Rejected Changes

*(None yet)*
