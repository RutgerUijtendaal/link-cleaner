# Link Cleaner

A standalone Chrome Manifest V3 extension that removes tracking parameters from
links on the pages you browse. It currently supports YouTube links, including dynamically
inserted links and ordinary HTTP(S) frames, without sending data anywhere.

## Download and install

Download **link-cleaner.zip** from [GitHub Releases](https://github.com/RutgerUijtendaal/link-cleaner/releases).
Choose the named ZIP asset, not GitHub's source-code archives.

Extract the ZIP into a permanent folder. Open `chrome://extensions`, enable
**Developer mode**, choose **Load unpacked**, and select the extracted folder
containing `manifest.json`. Reload existing tabs.

For updates, extract the new ZIP into the same folder, replacing the files, then
choose **Reload** on the extension's card and reload affected tabs. Unpacked
installations do not update automatically. No Chrome Web Store listing is published.

## Build from source

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

## Behavior and privacy

The extension removes `si`, `feature`, `gclid`, `fbclid` and `utm_*` from HTTP(S)
links to `youtu.be`, `youtube.com` and YouTube subdomains. It preserves other query
bytes and fragments, including video IDs, timestamps, playlists and positions.

The content script inspects anchor and image-map destinations. When a link's label
is itself a URL pointing to the same cleaned destination, it cleans that label too,
including URLs split across nested spans. Custom labels such as "Watch video",
unrelated URL labels, icons and nested elements remain intact. It watches added
subtrees, href changes and link-text updates, and cleans links before interactions.
It uses no network requests, storage, cookies, clipboard API or background worker.
Chrome's site-access controls determine which websites it can modify.

It does not sweep shadow trees, unwrap redirect URLs, rewrite text outside links or share
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
- `src/clean-link-text.ts`: matching URL labels without replacing nested markup.
- `src/observe-links.ts`: initial scan, mutation observation and interaction hooks.
- `src/content.ts` and `src/manifest.json`: extension entry point and page access.
- `tests/`: URL-preservation and DOM behavior tests.
- `scripts/build.mjs`: self-contained script bundle and reproducible ZIP.

The repository owns its source, dependencies, tests and distribution artifacts.
Foundry is a separate project that presents an article and illustration about it;
neither repository needs the other's checkout to build or run. Foundry links to
this repository; release downloads are owned here.

## Release a version

The Check workflow verifies branch pushes and pull requests and saves a build
artifact. The Release workflow checks a pushed `v*` tag, runs the same full checks,
and publishes `link-cleaner.zip` with installation instructions and generated
release notes. It uses GitHub's built-in token; no publishing secret is required.

1. Update `src/manifest.json`, `package.json` and both root version fields in
   `package-lock.json` to the same three-part numeric version.
2. Run `npm run check`, commit the changes and integrate them into `main`.
3. From the intended commit on `main`, create and push the matching tag:

   ```sh
   git tag v0.1.1
   git push origin v0.1.1
   ```

Use the next unused version for subsequent releases. The workflow rejects tags
that do not match the package, lockfile and extension versions. Do not move or
reuse published version tags. A failed run can be rerun if no release was created;
an existing release is never overwritten automatically.
