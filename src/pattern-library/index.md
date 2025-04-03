---
title: "Pattern Library"
layout: "layouts/docs-page.njk"
---

It’s recommended that you use this system as **the single source of truth** for the UI.

## CSS

The CSS is processed with [PostCSS](https://postcss.org/) and uses [CUBE CSS](https://cube.fyi/) as the methodology. [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) is used as a utility class and CSS Custom Property generator. All partials are bundled into one single output CSS file: `global.css`.

## CSS Folder Structure

```
src
└── css
    ├── blocks
    ├── compositions
    ├── global
    ├── utilities
    └── global.css
```

The CSS folder mostly resembles the CUBE CSS structure and is as follows:

1. `blocks`: contained components
2. `compositions`: [layout compositions](/pattern-library/css-compositions/)
3. `global`: global styles, broken up into handy partials
4. `utilities`: [core utilities](/pattern-library/css-utilities/)
5. `global.css`: the main CSS file that pulls everything together

## JavaScript

The only JavaScript output from this pattern library is _extremely light_ user-interface code.

## Use the pattern generator

To prevent repetitive file creation, you can use the pattern generator to create a new pattern, or pattern’s variant with a npm task.

### Example

Let's say you want a new pattern called "my-pattern":

```bash
npm run patterns:create -- -p my-pattern -n my-pattern -t My\ Pattern
```

This will create the following folder and file structure:

```
src/
  └── pattern-library/
      └── patterns/
        └── my-pattern/
          ├── my-pattern.njk
          ├── my-pattern.json
          ├── my-pattern.md
```

Let's you want to create a variant of "my-pattern":

```bash
npm run patterns:create -- -p my-pattern/variants -n my-pattern-primary -t Primary
```

It'll result in this structure:

```
src/
  └── pattern-library/
      └── patterns/
        └── my-pattern/
          ├── my-pattern.njk
          ├── my-pattern.json
          ├── my-pattern.md
          └── variants/
            ├── my-pattern-primary.njk
            └── my-pattern-primary.json
```

### Arguments

There are 2 required arguments to pass in—`-p` and `-n`. The rest are optional.

Make sure you add the `--` _after_ `npm run patterns:create` so the arguments get passed into the task.

Also make sure you escape spaces with a `\`. Alternatively, you can use quotes, such as `-t 'My Title'`.

- `-p` is the path from `src/pattern-library/patterns`
- `-n` is the file name
- `-t` is the title. If this is not set, the `-n` will be used
- `-sm` allows you to skip markup being generated if you are generating a variant
