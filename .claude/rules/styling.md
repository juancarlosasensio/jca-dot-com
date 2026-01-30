# Styling Rules

Apply these rules when working with CSS, Tailwind, design tokens, or component styles.

## CUBE CSS Methodology

This project follows CUBE CSS. Apply styles in this hierarchy:

### 1. Composition (Layout)

High-level layout primitives. Use Tailwind utilities or custom composition classes.

```html
<div class="stack">
  <div class="cluster">...</div>
</div>
```

Common compositions: stack, cluster, sidebar, switcher, grid, center.

### 2. Utility (Design Tokens)

Single-purpose classes generated from design tokens.

```html
<p class="text-primary font-base space-m">...</p>
```

- Generated via `tailwind.config.js` from `src/design-tokens/`
- One property per class
- Use for spacing, colors, typography

### 3. Block (Components)

Component-specific styles in `src/css/blocks/`.

```css
/* src/css/blocks/card.css */
.card {
  /* Block-specific styles */
}
```

- Scoped to component
- Can use `@apply` for token utilities
- Keep selectors flat

### 4. Exception (State)

Variations via data attributes.

```html
<button class="button" data-variant="primary">...</button>
```

```css
.button[data-variant="primary"] {
  /* Exception styles */
}
```

## Design Tokens

### Location

`src/design-tokens/` contains JSON files for:

- Colors
- Spacing (size scale)
- Typography (fonts, sizes, weights)
- Text styles

### Rules

1. **Never hardcode values** - Use tokens always
2. **Use semantic names** - `text-primary` not `text-blue-500`
3. **Respect the scale** - Use predefined spacing steps

### Token → Tailwind Flow

```
src/design-tokens/*.json
    ↓
tailwind.config.js (extends theme)
    ↓
Utility classes available
```

## Tailwind Configuration

Location: `tailwind.config.js`

- Extends default theme with design tokens
- Custom plugins generate token utilities
- Content paths configured for Nunjucks templates

### Using Tailwind

- Prefer utility classes for composition/utility layers
- Use `@apply` sparingly, only in block CSS
- Don't fight Tailwind - if fighting, reconsider approach

## PostCSS Pipeline

Location: `postcss.config.js`

Features:

- CSS nesting (native syntax)
- Import globbing (`@import "blocks/*.css"`)
- Tailwind processing
- Minification (production)

### File Organization

```
src/css/
├── global/       # Reset, base styles
├── compositions/ # Layout primitives
├── blocks/       # Component styles
└── utilities/    # Custom utilities beyond Tailwind
```

## Style Decisions

When adding styles, ask:

1. Can this be a composition utility?
2. Can this use existing design tokens?
3. Does this belong in an existing block?
4. Should this be a new block in the pattern library?
