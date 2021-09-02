import { Config } from 'bili';

const config: Config = {
  input: ['src/index.ts'],
  output: {
    target: 'browser',
    format: ['cjs', 'cjs-min', 'es-min', 'module'],
    dir: 'lib',
    sourceMap: false,
  },
  bundleNodeModules: true,
  externals: [/@tarojs/, 'lodash'],
  plugins: {
    babel: false,
    typescript2: {
      // Override the config in `tsconfig.json`
      tsconfigOverride: {
        include: ['src'],
      },
    },
  },
};

export default config;
