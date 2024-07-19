require('esbuild').build({
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.js',
    bundle: true,
    // treeShaking: false,
    platform: 'node',
    minify: 'true',
});