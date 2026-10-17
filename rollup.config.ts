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
      file: 'builds/obsidian-custodian.mjs',
      format: 'esm',
      plugins: [terser()]
    },
    {
      banner,
      file: 'builds/obsidian-custodian.cjs',
      format: 'cjs',
      exports: 'default'
    },
    {
      banner,
      file: 'builds/obsidian-custodian.min.js',
      format: 'umd',
      name: 'obsidianCustodian',
      plugins: [
        terser(),
        sizeCheck({
          expect: 230, // Includes YAML parsing and direct HTML rendering; sizes in kb
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
    { file: 'builds/remark/obsidian-custodian.mjs', format: 'esm', plugins: [terser()] },
    {
      file: 'builds/remark/obsidian-custodian.cjs',
      format: 'cjs',
      exports: 'default',
      plugins: [terser()]
    }
  ]
}

// Keep the executable small by importing the existing ESM library bundle.
const cli = {
  input: 'bin/index.ts',
  external: ['node:fs', 'node:path', 'node:util', '../builds/obsidian-custodian.mjs'],
  output: {
    file: 'builds/cli.mjs',
    format: 'esm',
    paths: { '../builds/obsidian-custodian.mjs': './obsidian-custodian.mjs' }
  },
  plugins: [{
    name: 'executable-cli',
    writeBundle: () => fs.chmodSync('builds/cli.mjs', 0o755)
  }]
}

export default [main, remark, cli]
