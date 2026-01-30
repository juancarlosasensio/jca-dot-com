# Templates & Data Rules

Apply these rules when working with Nunjucks templates, layouts, data files, or collections.

## Nunjucks Templates

### Includes vs Macros vs Shortcodes

| Use | When |
|-----|------|
| `{% include "partial.njk" %}` | Static partials, no parameters needed |
| `{% macro name(params) %}` | Parameterized snippets, no external data access needed |
| Shortcodes | Need access to collections, global data, or async operations |

### Layout Chaining

```yaml
---
layout: base.njk
---
```

- Layouts live in `src/_includes/`
- Child templates inherit parent layout
- Use `{% block %}` for overridable sections

### Template Best Practices

- Keep logic minimal in templates
- Use filters for data transformation
- Use shortcodes for complex rendering
- Prefer `{% set %}` over inline expressions for readability

## Data Files

### Global Data (`src/_data/`)

- `*.json` - Static data, loaded at build time
- `*.js` - Dynamic data, can fetch/compute

```js
// src/_data/posts.js
module.exports = async function() {
  // Fetch, transform, return
}
```

### Directory Data

- `dirName.json` applies to all templates in that directory
- Useful for shared front matter (layout, tags, permalink patterns)

### Template Data

- `templateName.11tydata.js` for single-template data
- Overrides directory and global data

### Computed Data

```yaml
---
eleventyComputed:
  title: "{{ page.fileSlug | title }}"
  permalink: "/blog/{{ title | slugify }}/"
---
```

- Highest priority in data cascade
- Can reference other data values
- Evaluated per-template

## Collections

### Tag-Based Collections

```yaml
---
tags: blog
---
```

Access: `collections.blog`

### Custom Collections

```js
eleventyConfig.addCollection('featured', (collectionApi) => {
  return collectionApi.getAll().filter(item => item.data.featured)
})
```

### Collection Methods

- `getAll()` - all content
- `getAllSorted()` - sorted by date
- `getFilteredByTag(tag)` - by tag
- `getFilteredByGlob(glob)` - by file pattern

## Pagination

```yaml
---
pagination:
  data: collections.blog
  size: 10
  alias: posts
  generatePageOnEmptyData: true
---
```

- `size: 1` creates individual pages from array items
- `alias` provides cleaner variable name (cannot be `page` - reserved)
- Use `reverse: true` for newest-first
