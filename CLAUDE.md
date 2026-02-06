# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Eleventy v2.0.1** - Static site generator (CommonJS)
- **Nunjucks** - Templating engine (`.njk` files)
- **Tailwind CSS v3.3.5** - Utility-first CSS framework with PostCSS
- **Netlify** - Hosting platform with serverless functions

## Commands

- `npm run dev` - Start development server (runs Eleventy + PostCSS watch concurrently via Netlify Dev)
- `npm run build` - Production build (runs Eleventy + PostCSS with NODE_ENV=production)
- `npm run css` - Process CSS only (PostCSS)
- `npm run patterns:create` - Generate new pattern library component

## Architecture

### Eleventy Configuration

The project uses Eleventy v2 in CommonJS mode. Configuration in [.eleventy.js](.eleventy.js):

- **Input**: `src/` directory
- **Output**: `dist/` directory
- **Template engine**: Nunjucks (for markdown, data, and HTML)
- **Global variable**: `global.__basedir` provides root directory for pattern library includes

### Collections

Collections fetch external data and transform it for use in templates:

- **wpContent** ([src/collections/blog.js](src/collections/blog.js)) - Fetches WordPress posts via REST API with 8h cache, handles pagination across multiple pages
- **books** ([src/collections/books.js](src/collections/books.js)) - Book data collection
- **blogroll** ([src/collections/blogroll.js](src/collections/blogroll.js)) - Blogroll data collection

Collections use `@11ty/eleventy-fetch` with `AssetCache` for caching external API responses.

### Filters

Custom Nunjucks filters in [src/filters/](src/filters/):

- `simpleDate` - Date formatting
- `getNotes` - Filter for note-type posts
- `getPosts` - Filter for generic posts
- `getNowEntries` - Filter for now page entries
- `limit` - Limit array results

### Design System

The project uses **CUBE CSS methodology** (Composition, Utility, Block, Exception):

#### Design Tokens ([src/design-tokens/](src/design-tokens/))

JSON files define core design values:
- `colors.json` - Color palette
- `spacing.json` - Spacing scale (processed with clamp-generator)
- `fonts.json` - Font families
- `text-sizes.json` - Font sizes with fluid scaling
- `text-leading.json` - Line heights
- `text-weights.json` - Font weights
- `viewports.json` - Breakpoints

Tokens are processed through [tailwind.config.js](tailwind.config.js) via `tokens-to-tailwind.js` utility and generate both Tailwind classes and CSS custom properties (e.g., `--color-*`, `--space-*`, `--size-*`).

#### CSS Structure ([src/css/](src/css/))

- **blocks/** - Component-specific styles (e.g., `card.css`, `site-head.css`, `prose.css`)
- **compositions/** - Layout patterns following CUBE CSS
- **utilities/** - Utility classes
- **global/** - Global styles and resets

Custom Tailwind utilities are generated for CUBE CSS patterns: `--flow-space`, `--region-space`, `--gutter`, `--indent-color`.

#### Pattern Library ([src/pattern-library/](src/pattern-library/))

Reusable UI components with documentation. Each pattern has:
- `{name}.njk` - Nunjucks template
- `{name}.json` - Context data (title, default props)
- `{name}.md` - Documentation

Patterns include: `button`, `card`, `hero`, `prose`, `nav`, `site-head`, `site-foot`, `gallery`, `quote`, and more.

Use `npm run patterns:create` to scaffold new patterns:
```bash
node src/lib/code-sample-generator.js -b 'patterns' -p 'patterns' -n 'component-name' -t 'Component Title'
```

### Tailwind Configuration Notes

- **Preflight disabled** - No CSS reset from Tailwind
- **Opacity utilities disabled** - No `textOpacity`, `backgroundOpacity`, `borderOpacity`
- **Container blocked** - Custom container compositions used instead
- **Design tokens integrated** - All tokens available as Tailwind utilities and CSS custom properties

### Netlify Functions

Serverless functions in [netlify/functions/](netlify/functions/):
- `search-books.js` - Book search functionality

### Data Files

Global data in [src/_data/](src/_data/):
- `site.json` - Site metadata (name, URL, author)
- Additional data files available to all templates

### Pass-through Copy

Static assets copied directly to output:
- `src/fonts/` → `dist/fonts/`
- `src/images/` → `dist/images/`
- `src/js/` → `dist/js/`
- `src/_redirects` → `dist/_redirects` (Netlify redirects)

## Key Patterns

### External Data Fetching

When fetching external data (e.g., WordPress API):
1. Use `AssetCache` from `@11ty/eleventy-fetch`
2. Check cache validity before fetching
3. Handle pagination if API returns multiple pages
4. Process/sanitize data (e.g., decode HTML entities)
5. Save to cache for future builds

### Creating New Components

1. Use existing patterns from [src/pattern-library/patterns/](src/pattern-library/patterns/) when possible
2. Follow CUBE CSS methodology for styling
3. Use design tokens instead of hardcoded values
4. Create corresponding block CSS in [src/css/blocks/](src/css/blocks/)

### Working with Styles

1. Reference design tokens via CSS custom properties: `var(--color-primary)`, `var(--space-m)`, etc.
2. Use Tailwind utilities generated from tokens: `text-primary`, `space-m`, etc.
3. Create new blocks in `src/css/blocks/` for component-specific styles
4. Use composition classes for layout patterns
5. Avoid inline styles; extend tokens or create new blocks

## Development Notes

- Eleventy uses CommonJS (`require`, `module.exports`)
- Templates can use front matter for page-specific data
- Nunjucks templates can include patterns: `{% include "pattern-library/patterns/card/card.njk" %}`
- CSS processed via PostCSS with imports and nesting support
- Development server runs on Netlify Dev CLI for function testing
