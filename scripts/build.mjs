import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { zipSync } from 'fflate';

const root = new URL('../', import.meta.url);
const output = new URL('dist/extension/', root);
const result = await build({
    entryPoints: [fileURLToPath(new URL('src/content.ts', root))],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'chrome120',
    write: false,
});

const content = result.outputFiles[0].contents;
const manifest = await readFile(new URL('src/manifest.json', root));
await mkdir(output, { recursive: true });
await writeFile(new URL('content.js', output), content);
await writeFile(new URL('manifest.json', output), manifest);

// Fixed archive timestamps make identical builds reproducible.
const options = { mtime: new Date('2020-01-01T00:00:00Z') };
await writeFile(new URL('dist/link-cleaner.zip', root), zipSync({
    'manifest.json': [manifest, options],
    'content.js': [content, options],
}));
console.log('Built dist/extension and dist/link-cleaner.zip');
