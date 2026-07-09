import { rm } from 'node:fs/promises'
import pkg from '../package.json'

const entry = 'src/main.ts'
const outdir = 'dist'

await rm(outdir, { recursive: true, force: true })

async function buildEsm(): Promise<void> {
  const result = await Bun.build({
    entrypoints: [entry],
    format: 'esm',
    target: 'browser',
  })

  await Bun.write(`${outdir}/nested-sort.js`, await result.outputs[0].text())
}

/**
 * Bun's bundler has no native UMD format and `format: 'iife'` has no globalName
 * equivalent, so a default-only export is never actually attached anywhere. We
 * bundle to IIFE, then splice the result into a hand-written UMD shell (the same
 * shape Rollup emitted before this migration) so `factory()`'s return value
 * becomes `module.exports`, the AMD module, or the browser global uniformly.
 *
 * This must always minify *while bundling from source* — re-running an
 * already UMD-wrapped file back through Bun's bundler makes Bun mistake our
 * wrapper's `module`/`exports`/`define` references for a CommonJS module and
 * re-wrap (and shadow) them, breaking every branch.
 */
async function buildUmd(minify: boolean, outfile: string): Promise<void> {
  const result = await Bun.build({
    entrypoints: [entry],
    format: 'iife',
    target: 'browser',
    minify,
  })
  const iifeSource = await result.outputs[0].text()

  const match = iifeSource.match(/var (\w+)\s*=\s*[^;]+;\s*\}\)\(\);\s*$/)
  if (!match) {
    throw new Error(`UMD build: could not locate the default-export binding in the ${minify ? 'minified' : ''} IIFE bundle output`)
  }
  const exportedName = match[1]

  const body = iifeSource
    .replace(/^\(\(\)\s*=>\s*\{/, '')
    .replace(/\}\)\(\);\s*$/, '')

  const umd = `(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.${pkg.umdClassName} = factory());
})(this, (function () {
${body}
  return ${exportedName};
}));
`

  await Bun.write(outfile, umd)
  assertUmdWorks(umd, outfile)
}

function assertUmdWorks(umd: string, outfile: string): void {
  const globalResult = new Function('global', `${umd}; return globalThis.${pkg.umdClassName};`)({})
  if (typeof globalResult !== 'function') {
    throw new Error(`UMD self-check failed for ${outfile}: browser-global branch did not yield a function`)
  }

  const commonjsResult = require(`${process.cwd()}/${outfile}`)
  if (typeof commonjsResult !== 'function') {
    throw new Error(`UMD self-check failed for ${outfile}: CommonJS branch did not yield a function`)
  }

  let amdResult: unknown
  const fakeDefine = Object.assign((factory: () => unknown) => { amdResult = factory() }, { amd: true })
  new Function('global', 'define', umd)({}, fakeDefine)
  if (typeof amdResult !== 'function') {
    throw new Error(`UMD self-check failed for ${outfile}: AMD branch did not yield a function`)
  }
}

await buildEsm()
await buildUmd(false, `${outdir}/nested-sort.umd.js`)
await buildUmd(true, `${outdir}/nested-sort.umd.min.js`)
