import { createRequire } from 'node:module'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'

// Bundle ESM-only dependencies so require() also works on Node 18.
const config = ['index', 'remark'].map((name) => ({
  input: `src/${name}.js`,
  plugins: [
    {
      name: 'portable-entities',
      resolveId: (source, importer) => {
        // Use the entity table instead of the browser-only DOM decoder.
        if (source === 'decode-named-character-reference') {
          return createRequire(importer).resolve(source)
        }
      }
    },
    nodeResolve({ browser: true }), commonjs()
  ],
  output: [
    { file: `builds/${name}.js`, format: 'es', sourcemap: true },
    { file: `builds/${name}.cjs`, format: 'cjs', exports: 'default', sourcemap: true }
  ]
}))

export default config
