# JCA.com - Eleventy Project

## Stack

- Eleventy v2.0.1 (CommonJS)
- Nunjucks templating
- Tailwind CSS v3.3.5 + PostCSS
- Netlify (hosting + serverless functions)

## Commands

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run css` - Process CSS only
- `npm run patterns:create` - Create new pattern

## Directory Structure

- `src/_data/` - Global data (site.json, navigation.json)
- `src/_includes/` - Layouts and partials
- `src/pattern-library/` - 18+ reusable components
- `src/design-tokens/` - Colors, spacing, fonts, text styles
- `src/collections/` - Custom collection configs
- `src/filters/` - Custom Nunjucks filters
- `src/css/` - Stylesheets (blocks, compositions, global, utilities)
- `netlify/functions/` - Serverless functions

## Conventions

- CUBE CSS methodology (Composition, Utility, Block, Exception)
- Design tokens for all visual properties
- Pattern library for reusable UI components

## Documentation

- Eleventy v2 docs: https://v2.11ty.dev/docs/

## Agent Instructions

When making code changes, planning features, or reviewing code:

1. Always consult `.claude/agents/eleventy-expert.md` for Eleventy best practices
2. Apply rules from `.claude/rules/` based on the type of change
3. On every PR involving UI: ask if existing patterns from `src/pattern-library/` should be used
4. Suggest official Eleventy plugins when use cases match
