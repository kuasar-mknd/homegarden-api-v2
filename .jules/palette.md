# Palette's Journal 🎨

## Design System & Accessibility Patterns

- **Colors:** Uses CSS variables (`--primary`, `--secondary`, `--bg`, `--text`, `--card-bg`) for easy theming and dark mode support.
- **Radius System:** Uses `--radius-sm` (4px), `--radius-md` (8px), `--radius-lg` (12px), and `--radius-xl` (16px) for consistent corner rounding.
- **Shadow System:** Uses `--shadow-sm` and `--shadow-md` to standardize depth and elevation.
- **Typography:**
    - Uses system fonts stack.
    - Headings use `text-wrap: balance` for better readability.
    - Paragraphs use `text-wrap: pretty` to prevent widows/orphans.
    - Links use `text-decoration-skip-ink: auto` and `text-underline-offset: 4px`.
    - Reading width limited to `65ch` for optimal legibility.
- **Contrast & Visibility:**
    - `--on-primary` ensures text is readable on primary colored backgrounds (white in light mode, dark in dark mode).
    - `::selection` uses brand colors with high contrast text.
    - High Contrast Mode supported via transparent borders on buttons (visible when shadows/backgrounds are stripped).
- **Focus States:** `:focus-visible` uses a consistent 2px outline with 2px offset (applied to links, buttons, cards, and code blocks).
- **Interactivity:**
    - Buttons and cards have consistent hover/active states with shadow and scale transitions.
    - Buttons enforce `user-select: none` and `cursor: pointer`.
    - Active states include `filter: brightness(0.9)` for better feedback.
    - Footer links have increased touch targets (padding) and active states.
    - Icons are marked `focusable="false"` to prevent focus bugs.
- **Responsiveness:** Mobile-first approach where possible.
- **Skip Links:** A "Skip to main content" link is implemented for keyboard navigation.
- **Print Styles:** Print media query removes navigation, prevents breaking inside cards (`break-inside: avoid`), and ensures URLs are printed.
- **List Semantics:** Grid layouts of items use `ul` and `li` with `role="list"`.
- **Motion:** `prefers-reduced-motion` disables transitions. External link icons animate on hover.

## Rejected Changes

*(None yet)*
