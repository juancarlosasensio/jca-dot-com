# Infrastructure Rules

Apply these rules when working with Netlify, Eleventy plugins, or build configuration.

## Netlify Functions

### Location

`netlify/functions/`

### Syntax (v2)

```js
// netlify/functions/hello.js
export default async (request, context) => {
  return new Response(JSON.stringify({ message: 'Hello' }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

export const config = {
  path: '/api/hello'
}
```

### Best Practices

- Keep functions small and focused
- Handle errors with appropriate status codes
- Use environment variables for secrets
- Return proper Content-Type headers

### Environment Variables

- Set in Netlify dashboard for production
- Use `.env` locally (gitignored)
- Access via `process.env.VAR_NAME`

## Eleventy Plugins

### Adding a Plugin

```js
// .eleventy.js
const pluginRss = require('@11ty/eleventy-plugin-rss')

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss)
}
```

### Recommended Official Plugins

| Need | Plugin | Install |
|------|--------|---------|
| Navigation menus | `@11ty/eleventy-navigation` | `npm i @11ty/eleventy-navigation` |
| RSS/Atom feeds | `@11ty/eleventy-plugin-rss` | `npm i @11ty/eleventy-plugin-rss` |
| Remote data caching | `@11ty/eleventy-fetch` | `npm i @11ty/eleventy-fetch` |
| Image optimization | `@11ty/eleventy-img` | `npm i @11ty/eleventy-img` |

### When to Suggest Plugins

- **Navigation**: When building menus, breadcrumbs, or TOCs
- **RSS**: When adding feeds or syndication
- **Fetch**: When pulling data from external APIs
- **Image**: When optimizing images at build time

## Eleventy Configuration

### Location

`.eleventy.js` (root directory)

### Structure

```js
module.exports = function(eleventyConfig) {
  // Plugins
  eleventyConfig.addPlugin(...)

  // Filters
  eleventyConfig.addFilter(...)

  // Shortcodes
  eleventyConfig.addShortcode(...)

  // Collections
  eleventyConfig.addCollection(...)

  // Passthrough copy
  eleventyConfig.addPassthroughCopy(...)

  // Return config
  return {
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: '_site'
    },
    templateFormats: ['njk', 'md'],
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk'
  }
}
```

### Adding Features

1. Filters for data transformation
2. Shortcodes for reusable template snippets
3. Collections for content groupings
4. Transforms for output modification

## Build Process

### Commands

- `npm run dev` - Development with hot reload
- `npm run build` - Production build
- `npm run css` - CSS processing only

### Build Order

1. Eleventy processes templates
2. PostCSS processes stylesheets
3. Output to `_site/`

### Debugging

```bash
DEBUG=Eleventy* npm run build
```

## Deployment (Netlify)

### Configuration

`netlify.toml` (if present) or Netlify dashboard.

### Build Settings

- Build command: `npm run build`
- Publish directory: `_site`
- Node version: Specified in `.nvmrc` or `package.json`

### Headers & Redirects

Configure in `netlify.toml` or `_headers`/`_redirects` files.

## Version Compatibility

This project uses **Eleventy v2.0.1** (CommonJS).

- Use `require()` not `import`
- Reference v2 docs: https://v2.11ty.dev/docs/
- Don't use v3-only features (ESM config, etc.)
