import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { basename, dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

// These globals are used only inside functions evaluated in the browser.
/* global document, innerWidth */

const root = new URL('../', import.meta.url);
const svg = await readFile(new URL('store/icon.svg', root), 'utf8');
const channel = process.env.STORE_BROWSER_CHANNEL || 'chromium';
const browser = await chromium.launch({ channel });
try {
    const page = await browser.newPage();
    await mkdir(new URL('src/icons/', root), { recursive: true });
    for (const size of [16, 32, 48, 128]) {
        await page.setViewportSize({ width: size, height: size });
        await page.setContent(`<style>body{margin:0;background:transparent}svg{width:100vw;height:100vh;display:block}</style>${svg}`);
        const png = await page.screenshot({ omitBackground: true });
        await writeFile(new URL(`src/icons/icon-${size}.png`, root), png);
        if (size === 128) await writeFile(new URL('site/icon.png', root), png);
    }
} finally {
    await browser.close();
}

// Package the icon-equipped extension before capturing its real behavior.
execFileSync(process.execPath, [fileURLToPath(new URL('scripts/build.mjs', root))], { stdio: 'inherit' });
const routes = new Map([
    ['/demo', ['store/demo.html', 'text/html']],
    ['/promo', ['store/promo.html', 'text/html']],
    ['/icon.svg', ['store/icon.svg', 'image/svg+xml']],
    ['/', ['site/index.html', 'text/html']],
    ['/style.css', ['site/style.css', 'text/css']],
    ['/icon.png', ['site/icon.png', 'image/png']],
]);
const server = createServer(async (req, res) => {
    const route = routes.get(new URL(req.url, 'http://localhost').pathname);
    if (!route) { res.writeHead(404).end(); return; }
    try {
        res.setHeader('Content-Type', route[1]);
        res.end(await readFile(new URL(route[0], root)));
    } catch {
        res.writeHead(500).end();
    }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const profile = await mkdtemp(join(tmpdir(), 'link-cleaner-store-'));
const extension = fileURLToPath(new URL('dist/extension/', root));
let context;
try {
    context = await chromium.launchPersistentContext(profile, {
        channel, headless: true, viewport: { width: 1280, height: 800 },
        args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
    });
    const page = await context.newPage();
    for (const [query, name, expected] of [
        ['', 'clean-links', 'https://youtu.be/VIDEO?t=90'],
        ['?context', 'preserve-context', 'https://www.youtube.com/watch?v=VIDEO&list=PLAYLIST&t=90'],
    ]) {
        await page.goto(`${origin}/demo${query}`);
        await page.waitForFunction(value => document.querySelector('#cleaned')?.textContent === value, expected);
        assert.equal(await page.locator('#cleaned').getAttribute('href'), expected);
        if (query) {
            assert.equal(await page.locator('#custom').getAttribute('href'), 'https://youtu.be/VIDEO?t=90');
            assert.equal(await page.locator('#custom').textContent(), 'Watch video ↗');
        }
        await page.screenshot({ path: fileURLToPath(new URL(`store/screenshot-${name}.png`, root)) });
    }
    await page.setViewportSize({ width: 440, height: 280 });
    await page.goto(`${origin}/promo`);
    await page.screenshot({ path: fileURLToPath(new URL('store/promo-440x280.png', root)) });
    await mkdir(new URL('build/', root), { recursive: true });
    for (const [theme, width] of [['light', 1280], ['dark', 1280], ['light', 390]]) {
        await page.emulateMedia({ colorScheme: theme });
        await page.setViewportSize({ width, height: 900 });
        await page.goto(origin);
        assert.equal(await page.locator('h1').textContent(), 'Privacy policy');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        await page.screenshot({ path: fileURLToPath(new URL(`build/privacy-${theme}-${width}.png`, root)), fullPage: true });
    }
    console.log('Store assets captured from the actual extension; policy verified in light, dark and mobile views.');
} finally {
    await context?.close();
    await new Promise(resolve => server.close(resolve));
    // mkdtemp created this exact disposable directory for this process.
    assert.equal(dirname(resolve(profile)), resolve(tmpdir()));
    assert.ok(basename(profile).startsWith('link-cleaner-store-'));
    await rm(profile, { recursive: true, force: true });
}
