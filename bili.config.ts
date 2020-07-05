import { Config } from 'bili';

const config: Config = {
    input: './src/index.ts',
    output: {
        target: 'browser',
        format: ['cjs', 'cjs-min', 'es'],
        dir: 'lib',
        sourceMap: true
    },
    bundleNodeModules: true,
    externals: [/@tarojs/, 'lodash', 'path-to-regexp'],
    plugins: {
        babel: false
    }
};

export default config;
