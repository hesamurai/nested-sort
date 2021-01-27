import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
// import eslint from '@rollup/plugin-eslint'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

const extensions = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
]
const resolveOptions = {
  extensions,
}
const babelOptions = {
  extensions,
  exclude: 'node_modules/**',
  babelHelpers: 'bundled',
}

export default [
  // browser-friendly UMD build
  {
    input: 'src/main.ts',
    output: {
      name: pkg.umdClassName,
      file: pkg.browser,
      format: 'umd',
    },
    plugins: [
      resolve(resolveOptions),
      commonjs(),
      // eslint({
      //   throwOnError: true,
      //   throwOnWarning: true,
      // }),
      babel(babelOptions),
    ],
  },

  // Minified browser-friendly UMD build
  {
    input: 'src/main.ts',
    output: {
      name: pkg.umdClassName,
      file: pkg.browserMin,
      format: 'umd',
    },
    plugins: [
      resolve(resolveOptions),
      commonjs(),
      babel(babelOptions),
      terser(),
    ],
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: 'src/main.ts',
    external: [],
    plugins: [
      resolve(resolveOptions),
      babel(babelOptions),
    ],
    output: [
      { exports: 'default', file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
    ],
  },
]
