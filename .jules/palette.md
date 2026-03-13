# Palette's Journal 🎨

## Design System & Accessibility Patterns

- **Colors:** Uses CSS variables (`--primary`, `--secondary`, `--bg`, `--text`, `--card-bg`) for easy theming and dark mode support.
- **Radius System:** Uses `--radius-sm` (4px), `--radius-md` (8px), `--radius-lg` (12px), and `--radius-xl` (16px) for consistent corner rounding.
- **Shadow System:** Uses `--shadow-sm` and `--shadow-md` to standardize depth and elevation.
- **Animation System:** Standardizes motion with `--transition-speed` (0.2s) for consistent feel across buttons, cards, and links.
- **Typography:**
    - Uses system fonts stack.
    - Headings use `text-wrap: balance` for better readability.
    - Paragraphs use `text-wrap: pretty` to prevent widows/orphans.
    - Links use `text-decoration-skip-ink: auto` and `text-underline-offset: 4px`.
    - Reading width limited to `65ch` for optimal legibility.
    - List markers (`::marker`) are styled with `--secondary` for visual polish.
    - Blockquotes and `kbd` elements have consistent, theme-aware styling.
- **Contrast & Visibility:**
    - `--on-primary` ensures text is readable on primary colored backgrounds (white in light mode, dark in dark mode).
    - `::selection` uses brand colors with high contrast text.
    - High Contrast Mode supported via transparent borders on buttons (visible when shadows/backgrounds are stripped).
- **Focus States:** `:focus-visible` uses a consistent `--focus-ring-width` (2px) outline with `--focus-offset` (2px) and a dedicated `--focus-ring-color`.
- **Interactivity:**
    - Buttons and cards have consistent hover/active states with shadow and scale transitions.
    - Buttons enforce `user-select: none` and `cursor: pointer`.
    - Active states include `filter: brightness(0.9)` for better feedback.
    - Footer links have increased touch targets (padding) and active states.
    - Icons are marked `focusable="false"` to prevent focus bugs.
    - "Copy Path" functionality on error pages utilizes progressive enhancement (clipboard API with fallback safety).
- **Responsiveness:** Mobile-first approach where possible. `apple-mobile-web-app-title` meta tag included for iOS.
- **Skip Links:** A "Skip to main content" link is implemented for keyboard navigation with a descriptive title.
- **Print Styles:** Print media query removes navigation, interactive elements (like copy buttons), prevents breaking inside cards (`break-inside: avoid`), and ensures URLs are printed.
- **List Semantics:** Grid layouts of items use `ul` and `li` with `role="list"`.
- **Motion:** `prefers-reduced-motion` disables transitions. External link icons animate on hover.

## 2024-05-24 - Interactive Feedback & Security

**Learning:** Inline event handlers (like `onclick`) should be avoided even in simple templates to support strict Content Security Policy (CSP) and separation of concerns.
**Action:** Use `addEventListener` in a script block for all interactions, even simple history navigation.

**Learning:** Feedback text like "Checked!" can be ambiguous.
**Action:** Use explicit action verbs ("Copied!") paired with a universally recognized icon (Checkmark) for clarity and delight.

## Rejected Changes

*(None yet)*

## 2025-02-13 - [Add auditory feedback for clipboard copy]
**Learning:** Purely visual "Copied!" feedback is invisible to screen readers, making copy actions feel unresponsive. Including a standard `aria-live="polite"` visually hidden announcer div that receives synchronous text updates is a highly effective, minimal-overhead pattern to resolve this.
**Action:** Whenever a button action triggers purely visual success feedback (e.g., copying text or async UI state changes without full page reloads), immediately pair it with a `.sr-only` aria-live region update, and remember to clear it afterward to ensure subsequent identical actions are announced.
