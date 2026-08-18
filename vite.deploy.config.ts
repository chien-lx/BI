import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vite';
import baseConfig from './vite.config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function isReactAlias(alias: { find?: string | RegExp }): boolean {
  const find = alias?.find;
  if (typeof find === 'string') {
    return find === 'react' || find === 'react-dom';
  }
  if (find instanceof RegExp) {
    return find.source === '^react$' || find.source === '^react-dom$';
  }
  return false;
}

export default defineConfig(async (env) => {
  const base = await baseConfig(env);

  // 独立部署需要把 React 打包进产物，不能使用指向 window.React 的 shim
  if (base.resolve?.alias) {
    base.resolve.alias = base.resolve.alias.filter((a: any) => !isReactAlias(a));
  }

  return mergeConfig(base, {
    build: {
      outDir: path.resolve(__dirname, 'dist/online'),
      emptyOutDir: true,
      rollupOptions: {
        input: path.resolve(__dirname, 'src/prototypes/data-analysis-engine/index.html'),
      },
    },
  });
});
