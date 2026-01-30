# CLAUDE.md

Personal website and blog for Juan Carlos Asensio at https://juancarlosasensio.com. Built with Eleventy (11ty) static site generator, Tailwind CSS, and CUBE CSS methodology.

## Quick Commands

```bash
npm run dev      # Start dev server with live reload (runs on localhost:8888)
npm run build    # Production build (outputs to dist/)
npm run css      # Process CSS with PostCSS
npm run clean    # Remove and recreate dist/
npm run patterns:create -- -p path -n name -t "Title"  # Generate new UI pattern
```

## Project Structure

```
src/
├── _data/           # Global data (site.json, navigation.json, helpers.js)
├── _includes/       # Layouts, partials, macros, icons
│   ├── layouts/     # Base, page, docs-page templates (Nunjucks)
│   ├── partials/    # Reusable template fragments
│   └── macros/      # Nunjucks macros for components
├── collections/     # Data fetchers (blog.js, books.js, blogroll.js)
├── filters/         # Nunjucks filters (simpleDate, limit, etc.)
├── css/             # Styles organized by CUBE CSS methodology
│   ├── global/      # Reset, fonts, variables, global styles
│   ├── blocks/      # Component styles (button, card, nav, etc.)
│   ├── compositions/# Layout patterns
│   └── utilities/   # Utility classes
├── design-tokens/   # JSON tokens (colors, fonts, spacing, text-sizes)
├── pattern-library/ # Design system documentation and components
├── js/              # Client-side JavaScript (minimal, progressive enhancement)
└── fonts/, images/  # Static assets
netlify/functions/   # Serverless functions (search-books.js)
```

## Tech Stack

- **Eleventy 2.x** with Nunjucks templating (`.njk` files)
- **Tailwind CSS 3.x** configured with custom design tokens
- **CUBE CSS** methodology (Composition, Utility, Block, Exception)
- **PostCSS** with nesting, imports, and cssnano for production
- **Netlify** for hosting and serverless functions

## External Data Sources

- **WordPress REST API**: Blog posts fetched via `src/collections/blog.js` (8-hour cache)
- **Airtable**: Book data via `src/collections/books.js`
- **Open Library API**: Book search in `netlify/functions/search-books.js`

## Code Style

Follow the Prettier config (`.prettierrc`):
- 2-space indentation, single quotes, no trailing commas
- No bracket spacing, arrow parens avoided
- 90 character print width

### CSS Conventions
- Use CUBE CSS: compositions for layout, blocks for components, utilities for tweaks
- Design tokens in `src/design-tokens/` are the source of truth for colors, spacing, typography
- CSS custom properties (variables) defined in `src/css/global/variables.css`
- New component styles go in `src/css/blocks/`

### Template Conventions
- Layouts extend `base.njk` → most pages use `page.njk`
- Use macros from `src/_includes/macros/` for reusable components
- Partials in `src/_includes/partials/` for shared template fragments

## Common Tasks

**Add a new page**: Create `.md` or `.njk` file in `src/` with frontmatter specifying layout

**Add a new CSS block component**: Create file in `src/css/blocks/`, it auto-imports via glob

**Add a new pattern**: Run `npm run patterns:create -- -p patterns/name -n name -t "Title"`

**Modify navigation**: Edit `src/_data/navigation.json`

**Add a filter**: Create in `src/filters/`, register in `.eleventy.js`

## Environment Variables

Required in `.env` (never commit):
- WordPress API URL for blog posts
- Airtable API key and base ID for books

## Gotchas

- Blog content comes from external WordPress; changes there won't reflect until cache expires or rebuild
- Design tokens must be updated in JSON files, not directly in CSS/Tailwind config
- The `dist/` folder is generated; never edit files there directly
- CSS imports use glob patterns; file naming matters for load order
