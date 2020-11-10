import resolve from 'rollup-plugin-node-resolve';
import minify from 'rollup-plugin-babel-minify';

export default [
    {
        input: 'src/ForeignHtmlRenderer.mjs',
        plugins: [
            resolve({})
        ],
        output: {
            name: 'ForeignHtmlRenderer',
            file: 'dist/foreign-html-renderer.js',
            format: 'iife'
        }
    },
    {
        input: 'src/ForeignHtmlRenderer.mjs',
        plugins: [
            resolve({}),
            minify({
                comments: false      
            })        
        ],
        output: {
            name: 'ForeignHtmlRenderer',
            file: 'dist/foreign-html-renderer.min.js',
            format: 'iife'
        }
    }    
];
