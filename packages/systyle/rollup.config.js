import typescript from 'rollup-plugin-typescript2'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'

const pkg = require('./package.json')

export default {
  input: 'src/index.ts',

  output: [
    { file: pkg.main, name: 'systyle', format: 'umd' },
    { file: pkg.module, format: 'es' }
  ],

  // external: ['emotion'],

  plugins: [
    resolve(),
    commonjs({ include: 'node_modules/**' }),
    typescript({ cacheRoot: '/tmp/.rpt2-cache' })
  ]
}