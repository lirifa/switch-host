import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['index.js'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/switch-host.js',
  minify: true,
  minifyWhitespace: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  legalComments: 'none',
  sourcemap: false,
  banner: {
    js: '#!/usr/bin/env node'
  },
  external: []
});

console.log('✓ Build completed: dist/switch-host.js');
