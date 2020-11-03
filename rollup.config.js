import resolve from 'rollup-plugin-node-resolve';

export default {
    input: 'src/ForeignHtmlRenderer.mjs',
    plugins: [
        resolve({})
    ],
    output: {
        name: 'ForeignHtmlRenderer',
        file: 'dist/ForeignHtmlRenderer.js',
        format: 'iife'
    }
};
