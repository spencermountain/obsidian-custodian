import { createRequire } from 'node:module'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import sizeCheck from 'rollup-plugin-filesize-check'
import terser from '@rollup/plugin-terser'
import fs from 'node:fs'

const pkg = JSON.parse(fs.readFileSync('./package.json').toString())

const banner = `/* spencermountain/${pkg.name} ${pkg.version} ${pkg.license} */`

// Bundle the page API for ESM, CommonJS, and a browser global.
const main = {
  input: 'src/index.js',
  plugins: [
    nodeResolve({ browser: true }),
    commonjs(),
    {
      name: 'portable-entities',
      resolveId: (source, importer) => {
        // Use the entity table instead of the browser-only DOM decoder.
        if (source === 'decode-named-character-reference') {
          return createRequire(importer).resolve(source)
        }
      }
    }
  ],
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
      format: 'cjs'
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
  input: 'src/remark.js',
  output: [
    { file: 'builds/remark/obsidian-parser.mjs', format: 'esm', plugins: [terser()] },
    { file: 'builds/remark/obsidian-parser.cjs', format: 'cjs', plugins: [terser()] }
  ]
}

export default [main, remark]
