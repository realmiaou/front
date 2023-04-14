import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser';


export default {
  input: 'src/index.ts',
  output: {
    dir: 'lib',
    format: 'cjs'
  },
  external: ['firebase/functions', 'firebase/firestore', 'vuex-class-component'],
  plugins: [typescript(), commonjs(), resolve(), terser()]
}
