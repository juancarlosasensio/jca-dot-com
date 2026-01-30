# Assets Rules

Apply these rules when working with images, static files, and client-side JavaScript.

## Static Assets

### Passthrough Copy

Configured in `.eleventy.js` via `addPassthroughCopy()`.

```js
eleventyConfig.addPassthroughCopy('src/images')
eleventyConfig.addPassthroughCopy('src/fonts')
eleventyConfig.addPassthroughCopy({ 'src/favicon.ico': 'favicon.ico' })
```

### Adding New Asset Types

1. Check if passthrough already configured
2. If not, add to `.eleventy.js`
3. Place files in configured source directory

## Images

### Current Strategy

This project uses its existing image handling approach. Respect and extend it rather than replacing.

### Best Practices

- **Lazy loading**: Only for below-fold images
  ```html
  <img src="..." loading="lazy" alt="...">
  ```
- **Above-fold images**: No lazy loading (hurts LCP)
- **Alt text**: Always provide meaningful descriptions
- **Dimensions**: Include width/height to prevent layout shift

### If Adding Image Optimization

Consider `@11ty/eleventy-img` but integrate with existing patterns:

```js
// Example shortcode pattern
eleventyConfig.addShortcode('image', async function(src, alt, sizes) {
  // Use eleventy-img, output to existing image directory
})
```

## Fonts

### Location

Typically in `src/fonts/` or loaded via CSS.

### Self-Hosted Fonts

- Add to passthrough copy
- Reference in CSS with `@font-face`
- Define in design tokens

### Web Fonts

- Use `font-display: swap` for performance
- Preload critical fonts in `<head>`

## Client-Side JavaScript

### Location

`src/js/`

### Patterns

- Keep JS minimal (static site philosophy)
- Progressive enhancement over JS-required features
- Use `type="module"` for modern syntax

### Build Process

Follows existing project bundling/processing.

## Video Embeds

### YouTube

Prefer `lite-youtube-embed` for performance:

```html
<lite-youtube videoid="VIDEO_ID"></lite-youtube>
```

Instead of standard iframe embeds (blocks rendering, loads heavy resources).

## File Organization

```
src/
├── images/       # Image assets
├── fonts/        # Self-hosted fonts
├── js/           # Client-side JavaScript
└── [other assets configured in .eleventy.js]
```

## Performance Considerations

1. Optimize images before adding to repo
2. Use modern formats (WebP) with fallbacks where supported
3. Minimize client-side JS
4. Leverage browser caching via Netlify headers
