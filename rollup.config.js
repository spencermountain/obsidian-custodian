import { createRequire } from 'node:module'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import sizeCheck from 'rollup-plugin-filesize-check'
import terser from '@rollup/plugin-terser'
import fs from 'node:fs'

const pkg = JSON.parse(fs.readFileSync('./package.json').toString())

const banner = `/* spencermountain/${pkg.name} ${pkg.version} ${pkg.license} */`

const plugins = () => [
  {
    name: 'portable-entities',
    resolveId: (source, importer) => {
      if (source === 'decode-named-character-reference') {
        return createRequire(importer).resolve(source)
      }
    }
  },
  nodeResolve({ browser: true }),
  commonjs()
]

// Bundle the page API for ESM, CommonJS, and a browser global.
const main = {
  input: 'lib/index.js',
  plugins: plugins(),
  output: [
    {
      banner,
      file: 'builds/obsidian-parser.mjs',
      format: 'esm',
      plugins: [terser()]
    },
    {
      banner,
      file: 'builds/obsidian-parser.cjs',
      format: 'cjs', exports: 'default'
    },
    {
      banner,
      file: 'builds/obsidian-parser.min.js',
      format: 'umd',
      name: 'obsidianParser',
      plugins: [
        terser(),
        sizeCheck({
          expect: 175, // sizes in kb
          warn: 15, // acceptable change (+/-)
          throw: 50 // unacceptable change (+/-)
        })
      ]
    }
  ]
}
// Keep the remark adapter separate from the Page API and its bundled runtime.
const remark = {
  input: 'lib/remark.js',
  plugins: plugins(),
  output: [
    { file: 'builds/remark/obsidian-parser.mjs', format: 'esm', plugins: [terser()] },
    { file: 'builds/remark/obsidian-parser.cjs', format: 'cjs', exports: 'default', plugins: [terser()] }
  ]
}

export default [main, remark]
