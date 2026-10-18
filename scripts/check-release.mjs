import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const [pkg, lock, manifest] = await Promise.all([
    readJson('package.json'),
    readJson('package-lock.json'),
    readJson('src/manifest.json'),
]);
const tag = process.argv[2];

assert.match(pkg.version, /^\d+\.\d+\.\d+$/, 'Releases require a three-part numeric version');
assert.equal(manifest.version, pkg.version, 'Extension and package versions must match');
assert.equal(lock.version, pkg.version, 'Lockfile version must match the package');
assert.equal(lock.packages[''].version, pkg.version, 'Lockfile root version must match the package');
assert.equal(tag, `v${pkg.version}`, 'Release tag must match the extension version');
console.log(`Verified release ${tag}`);
