import { build } from 'esbuild';

build({
  entryPoints: ['src/main.jsx'],
  bundle: true,
  minify: true,
  sourcemap: true,
  outdir: 'build',
  format: 'esm',
  loader: {
    '.png': 'dataurl',
    '.jsx': 'jsx',
  },
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
}).catch((error) => {
  console.error(error);
  process.exit(1);
})