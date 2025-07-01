# jca-dot-com

This repository contains the Eleventy site for juancarlosasensio.com.

## Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

When running in development, asset URLs should **not** contain the `assetHash` query parameter.

## Production build

Create a production build:

```bash
npm run build
```

During the production build `NODE_ENV` is set to `production` and the layout
appends a random hash to asset URLs to aid cache busting.

After deployment, visit the live site and verify that CSS and JS assets include
a random query string such as `/css/global.css?abcd-efgh-ijkl`.
