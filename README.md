# TED Browser

React + TypeScript + Vite app for browsing TED procurement notices.

## Development

```sh
npm install
npm run dev
```

The local Vite dev server proxies `/api/ted/*` to `https://api.ted.europa.eu/*`.

## Production Build

```sh
npm run build
npm run preview
```

## GitHub Pages

This repo includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.
It builds and republishes the app to GitHub Pages on every push to `main` or `master`.

In GitHub, enable Pages with:

1. Repository `Settings` -> `Pages`
2. `Build and deployment` -> `Source` -> `GitHub Actions`

The workflow automatically sets the Vite base path to `/<repo-name>/`, so assets load correctly from a project Pages URL such as `https://<owner>.github.io/<repo-name>/`.

### TED API Base URL

GitHub Pages is static hosting and cannot run the local `/api/ted` proxy from `server.cjs`.
For hosted searches, configure a repository variable named `TED_API_BASE` to the browser-reachable API base URL, including `/v3`.

Examples:

```text
https://api.ted.europa.eu/v3
https://your-proxy.example.com/api/ted/v3
```

If the TED API does not allow browser CORS requests from your Pages origin, use a small external proxy and set `TED_API_BASE` to that proxy.
