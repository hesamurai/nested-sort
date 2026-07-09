# Nested Sort

[![npm version](https://badge.fury.io/js/nested-sort.svg)](https://badge.fury.io/js/nested-sort)
[![](https://data.jsdelivr.com/v1/package/npm/nested-sort/badge)](https://www.jsdelivr.com/package/npm/nested-sort)

Nested Sort is a vanilla JavaScript library, without any dependencies, which helps you to sort a nested list of items via drag and drop.

![](demo.gif)

## Docs

[hesamurai.com/nested-sort](https://www.hesamurai.com/nested-sort)

## Download

 * [CDN copies](https://www.jsdelivr.com/package/npm/nested-sort)

## Installation

Using npm:
```shell
$ npm install nested-sort
```

## Contribution

This project uses [Bun](https://bun.sh) exclusively — as the package manager, bundler, and test runner. There is no Node.js/npm step anywhere in the toolchain.

### Developer environment requirements

- Bun >= 1.2 — install it with `curl -fsSL https://bun.sh/install | bash` (or see [bun.sh/install](https://bun.sh/install) for other platforms).

### Getting set up

```sh
bun install
```

This also runs `bun run build` once (via the `prepare` script), so `dist/` is populated immediately after cloning.

### Dev mode — working on the library

```sh
bun run dev
```

This starts a Bun dev server on **http://localhost:3000**. Open it in a browser to see the sample index (the same pages listed in `dev/index.html`), e.g. http://localhost:3000/data-driven-list.

Unlike the old Rollup-based `npm run watch`, there is **no build step in this loop**: every `dev/*.html` page loads its demo logic from a sibling `dev/<name>.ts` file via `<script type="module" src="...">`, which imports `NestedSort` straight from `../src/main.ts`. Bun's dev server bundles/transpiles that on every request, so editing anything under `src/` and refreshing the page picks up the change immediately — nothing under `dist/` is touched, and you don't need to run a build in a separate terminal.

**To add a new dev sample page:**
1. Create `dev/<name>.html` (copy an existing one for the boilerplate `<head>`/CSS include) with `<script type="module" src="<name>.ts"></script>` near the end of `<body>`.
2. Create `dev/<name>.ts` with your demo code, importing the library as `import NestedSort from '../src/main'`.
3. Register the route in `dev/dev-server.ts`: add an `import <name>Page from './<name>.html'` line and a `'/<name>': <name>Page` entry in the `routes` object — Bun's HTML-import bundling only picks up HTML files that are statically imported like this, so this step is required, not optional.
4. Add a link to it in `dev/index.html`.

If a page needs a handler invoked from an inline HTML attribute (`onclick`, `onchange`, etc.), remember that top-level bindings in a `<script type="module">` don't leak onto `window` the way classic scripts do — explicitly assign the function to `window` (see `dev/enable-disable.ts` or `dev/nesting-levels.ts` for examples) or switch to `addEventListener` instead.

### Running tests

```sh
bun test
bun test --coverage
bun test --watch
```

Tests use [`bun:test`](https://bun.com/docs/test/writing), which has a Jest-compatible API but does **not** auto-inject globals — every test file explicitly imports what it needs from `'bun:test'` (`describe`, `it`, `expect`, `jest`, etc.). The jsdom shim that gives tests a `document`/`window`/`HTMLElement`-family global environment lives in `test/__mocks__/dom.js` and is loaded via the `[test].preload` option in `bunfig.toml`, not a jest-style `setupFiles` option.

### Linting

```sh
bun run lint
```

Runs ESLint over `src/**/*.ts` and `test/**/*.js` (config in `.eslintrc.cjs`). This is a separate step from the build — unlike the old Rollup setup, linting is no longer wired into the bundler itself.

### Building

```sh
bun run build
```

Runs `build:types` (`tsc --emitDeclarationOnly`, producing the `.d.ts` files) and `build:js` (`scripts/build.ts`) and writes everything to `dist/`:

- `dist/nested-sort.js` — ESM build, the package's `import`/`module`/`exports` entry point.
- `dist/nested-sort.umd.js` / `dist/nested-sort.umd.min.js` — UMD build, for `<script src>` (sets `window.NestedSort`), `require()`, or AMD `define()`. This is unchanged in how consumers use it from before this project migrated off Rollup.

There is no CJS build of the ESM entry point anymore — `require('nested-sort')` via the package name is not supported, only `import`. The `dist/nested-sort.umd.js` file itself still works with `require()` (by direct path) if you need that.

Bun's bundler has no built-in `umd` output format (only `esm`, `cjs`, `iife`), so `scripts/build.ts` builds an `iife` bundle from `src/main.ts` and splices it into a small hand-written UMD wrapper (the same shape Rollup used to emit for a default-only export). Every UMD build **self-verifies** by executing the result three ways (as a global-scope script, via `require()`, and via a fake AMD `define()`) and throws if any branch doesn't yield the `NestedSort` class — so a build failure here means Bun's bundler output shape changed, not that the wrapper is silently broken.

### Releasing

1. Bump the `version` field in `package.json` (and commit as `chore(release): version X.Y.Z`, matching existing history).
2. `bun run build` to refresh `dist/` (also happens automatically via `prepare` on `npm publish`/`bun publish`).
3. Publish (`npm publish` or `bun publish`) and push the version-bump commit.
