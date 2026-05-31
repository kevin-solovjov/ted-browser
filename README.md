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
https://your-proxy.example.com/api/ted/v3
```

The TED API does not currently return the CORS headers needed for direct calls from GitHub Pages, so hosted searches need a small external proxy.
This repo includes a Cloudflare Worker example at `proxy/cloudflare-worker.js`.

After deploying a proxy, add this repository variable in GitHub:

```text
TED_API_BASE=https://your-proxy.example.com/api/ted/v3
```

Then rerun the Pages workflow or push a new commit.
