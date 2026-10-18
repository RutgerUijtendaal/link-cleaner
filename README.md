# Link Cleaner

A standalone Chrome Manifest V3 extension that removes tracking parameters from
links on the pages you browse. It currently supports YouTube links, including dynamically
inserted links and ordinary HTTP(S) frames, without sending data anywhere.

## Build and install

Requires Node.js 22 or newer and npm. From this repository:

```sh
npm ci
npm run build
```

Open `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**
and select this project's `dist/extension` directory. Reload existing tabs.
The portable ZIP is `dist/link-cleaner.zip`; extracting it produces the
same two files. To update an unpacked installation, rebuild and choose **Reload**
on the extension's card, then reload affected tabs.

The source repository is [RutgerUijtendaal/link-cleaner](https://github.com/RutgerUijtendaal/link-cleaner).
It is currently private. No downloadable release or Chrome Web Store listing has
been published; repository collaborators can build the extension locally.

## Behavior and privacy

The extension removes `si`, `feature`, `gclid`, `fbclid` and `utm_*` from HTTP(S)
links to `youtu.be`, `youtube.com` and YouTube subdomains. It preserves other query
bytes and fragments, including video IDs, timestamps, playlists and positions.

The content script inspects anchor and image-map destinations. It watches added
subtrees and href changes and cleans links before ordinary link interactions.
It uses no network requests, storage, cookies, clipboard API or background worker.
Chrome's site-access controls determine which websites it can modify.

It does not sweep shadow trees, unwrap redirect URLs, rewrite plain text or share
fields, intercept the clipboard, clean the address bar or block requests.
Protected browser pages cannot run the script, and page scripts that navigate
using their own stored URLs can bypass changes to DOM links. Removing parameters
does not prevent YouTube's other tracking mechanisms.

## Development

```sh
npm run check
```

This runs ESLint, TypeScript, the behavior tests and the build. Individual commands
are `npm run lint`, `npm run typecheck`, `npm test` and `npm run build`.

- `src/clean-url.ts`: conservative URL cleaning.
- `src/observe-links.ts`: initial scan, mutation observation and interaction hooks.
- `src/content.ts` and `src/manifest.json`: extension entry point and page access.
- `tests/`: URL-preservation and DOM behavior tests.
- `scripts/build.mjs`: self-contained script bundle and reproducible ZIP.

The repository owns its source, dependencies, tests and distribution artifacts.
Foundry is a separate project that presents an article and illustration about it;
neither repository needs the other's checkout to build or run. Foundry links to
this repository; future release downloads should also be owned here.
