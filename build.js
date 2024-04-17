import { build } from 'esbuild';

build({
  entryPoints: ['src/main.jsx'],
  bundle: true,
  minify: true,
  sourcemap: true,
  outdir: 'build',
  format: 'esm', // Ajoutez cette ligne
  loader: {
    '.png': 'dataurl', // ou 'file'
  },
}).catch(() => process.exit(1))