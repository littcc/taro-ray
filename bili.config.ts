import { Config } from 'bili';

const config: Config = {
  input: './src/index.ts',
  output: {
    target: 'browser',
    format: ['cjs', 'cjs-min', 'es-min'],
    dir: 'lib',
    sourceMap: false,
  },
  bundleNodeModules: true,
  externals: [/@tarojs/, 'lodash'],
  plugins: {
    babel: false,
  },
};

export default config;
