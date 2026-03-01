import { copyFileSync, rmSync, readdirSync } from 'node:fs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

/**
 * After bundling declarations, copies the single .d.ts to .d.cts
 * and removes leftover per-module .d.ts files from the TypeScript pass.
 */
function finaliseDts() {
  return {
    name: 'finalise-dts',
    writeBundle() {
      copyFileSync('dist/index.d.ts', 'dist/index.d.cts');
      // Remove per-module declaration files left by the TS compilation pass
      for (const file of readdirSync('dist')) {
        if ((file.endsWith('.d.ts') && file !== 'index.d.ts') || file.endsWith('.d.ts.map')) {
          rmSync(`dist/${file}`);
        }
      }
    },
  };
}

export default [
  // 1. ESM build — emits JS + per-module .d.ts files
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'esm',
      sourcemap: true,
    },
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    plugins: [
      resolve(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist',
        outputToFilesystem: true,
      }),
    ],
  },
  // 2. CJS build — JS only, no declarations
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
    },
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    plugins: [
      resolve(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationDir: undefined,
        declarationMap: false,
        outputToFilesystem: true,
      }),
    ],
  },
  // 3. Bundle declarations into a single .d.ts, then copy to .d.cts
  {
    input: 'dist/index.d.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm',
    },
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    plugins: [dts(), finaliseDts()],
  },
];
