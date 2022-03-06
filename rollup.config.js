import babel from '@rollup/plugin-babel'
import scss from 'rollup-plugin-scss'
import typeScript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'

const name = 'createModalInstance'
const lcName = 'modal'

/** @type {import('rollup').RollupOptions} */
const base = {
  input: 'src/index.ts',
  output: {
    name: name,
    file: `dist/${lcName}.js`,
    format: 'umd',
    exports: 'default',
  },
  plugins: [
    typeScript({ tsconfig: 'tsconfig.json' }),
    babel({
      babelrc: false,
      babelHelpers: 'bundled',
      presets: [
        [
          '@babel/preset-env',
          { modules: 'commonjs', loose: true, targets: { node: '10' } },
        ],
        ['@babel/preset-typescript'],
      ],
      plugins: [['@babel/plugin-proposal-object-rest-spread', { loose: true }]],
      exclude: 'node_modules/**',
    }),
    scss({
      output: `dist/${lcName}.css`,
    }),
  ],
}

/** @type {import('rollup').RollupOptions} */
const minify = {
  ...base,
  output: {
    ...base.output,
    format: 'umd',
    file: `dist/${lcName}.min.js`,
  },
  plugins: [
    typeScript({ tsconfig: 'tsconfig.json' }),
    babel({
      babelrc: false,
      babelHelpers: 'bundled',
      presets: [
        [
          '@babel/preset-env',
          { modules: 'commonjs', loose: true, targets: { node: '10' } },
        ],
        ['@babel/preset-typescript'],
      ],
      plugins: [['@babel/plugin-proposal-object-rest-spread', { loose: true }]],
      exclude: 'node_modules/**',
    }),
    scss({
      output: `dist/${lcName}.min.css`,
      outputStyle: 'compressed',
    }),
    terser(),
  ],
}

/** @type {import('rollup').RollupOptions} */
const es = {
  ...base,
  output: {
    ...base.output,
    format: 'es',
    file: `dist/${lcName}.es.js`,
  },
}

export default [base, minify, es]
