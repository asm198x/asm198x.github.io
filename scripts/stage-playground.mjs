#!/usr/bin/env node
// Copy the assembler's browser module into public/playground/.
//
// The playground page loads /playground/asm198x_web.js at runtime. The module
// is @asm198x/web (every architecture), installed from npm at the version
// pinned in package.json and built once by Asm198x from a release (umbrella
// decisions/browser-bundles-ship-as-npm-packages.md), so this site compiles
// no Rust.
import {cpSync, mkdirSync, readFileSync, rmSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const pkg = path.dirname(require.resolve('@asm198x/web/package.json'));
const out = path.resolve('public/playground');
rmSync(out, {recursive: true, force: true});
mkdirSync(out, {recursive: true});
for (const file of ['asm198x_web.js', 'asm198x_web_bg.wasm']) cpSync(path.join(pkg, file), path.join(out, file));
const {version} = JSON.parse(readFileSync(path.join(pkg, 'package.json'), 'utf8'));
console.log(`playground: staged @asm198x/web ${version}`);
