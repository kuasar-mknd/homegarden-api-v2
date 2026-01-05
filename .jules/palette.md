# Palette's Journal 🎨

## Design System & Accessibility Patterns

- **Colors:** Uses CSS variables (`--primary`, `--secondary`, `--bg`, `--text`, `--card-bg`) for easy theming and dark mode support.
- **Radius System:** Uses `--radius-sm` (4px), `--radius-md` (8px), `--radius-lg` (12px), and `--radius-xl` (16px) for consistent corner rounding.
- **Typography:** Uses system fonts stack for performance and native feel.
    - `text-wrap: balance` for headings (`h1-h6`) to improve readability and prevent widows.
    - `text-wrap: pretty` for paragraphs (`p`) to optimize line breaking.
- **Focus System:** Standardized via CSS variables:
    - `--focus-ring-color`: `var(--primary)`
    - `--focus-ring-width`: `2px`
    - `--focus-offset`: `4px` (or `2px` for buttons)
    - `:focus-visible` is used for keyboard accessibility, ensuring elements are clearly highlighted without interfering with mouse usage.
- **Responsiveness:** Mobile-first approach where possible, or simple media queries for grid layouts.
- **Selection:** `::selection` uses brand secondary color and white text for better visibility and branding.
- **Skip Links:** A "Skip to main content" link is implemented for keyboard navigation, hidden until focused.
- **Print Styles:** Print media query removes navigation and unnecessary decorations to provide a clean document view.
- **List Semantics:** Grid layouts of items use `ul` and `li` with `role="list"` to provide structure for screen readers.
- **Motion:** `prefers-reduced-motion` disables transitions.
- **Meta:** `theme-color` matches the primary brand color. `og:image` is included for social sharing.
- **Scrollbar:** `scrollbar-gutter: stable` prevents layout shifts when scrollbars appear/disappear.
- **Interaction:**
    - `cursor: pointer` explicitly set on `.btn` classes.
    - `user-select: none` applied to buttons to prevent accidental text selection during interaction, but **not** on badges (rejected change).
- **Code Blocks:** Scrollable code blocks (`.code-block`) include `tabindex="0"` to ensure keyboard accessibility.

## Rejected Changes

- **Badge Selection:** Applying `user-select: none` to badges was rejected because they often contain copyable information (e.g., version numbers).
- **Script Injection:** Injecting empty event listeners for history navigation in the 404 page was rejected as dead code.
