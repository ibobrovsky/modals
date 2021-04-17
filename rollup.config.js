import babel from '@rollup/plugin-babel'
import { terser } from 'rollup-plugin-terser'
import scss from 'rollup-plugin-scss'

const base = {
    input: 'src/index.js',
    output: {
        name: 'Modal',
        format: 'umd',
        file: 'dist/modal.js',
        exports: 'default',
    },
    plugins: [
        babel({
            babelrc: false,
            babelHelpers: 'bundled',
            presets: [['@babel/preset-env', { modules: false, loose: true }]],
            plugins: [['@babel/plugin-proposal-object-rest-spread', { loose: true }]],
            exclude: 'node_modules/**',
        }),
        scss({
            output: 'dist/modal.css'
        })
    ],
}

const minify = {
    ...base,
    output: {
        ...base.output,
        format: 'umd',
        file: 'dist/modal.min.js',
    },
    plugins: [
        babel({
            babelrc: false,
            babelHelpers: 'bundled',
            presets: [['@babel/preset-env', { modules: false, loose: true }]],
            plugins: [['@babel/plugin-proposal-object-rest-spread', { loose: true }]],
            exclude: 'node_modules/**',
        }),
        scss({
            output: 'dist/modal.min.css',
            outputStyle: "compressed"
        }),
        terser()
    ],
}

const es = {
    ...base,
    output: {
        ...base.output,
        format: 'es',
        file: 'dist/modal.es.js',
    },
}

export default [base, minify, es]