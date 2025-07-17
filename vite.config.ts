// vite.config.ts
import { vitePlugin as remix } from '@remix-run/dev';
import { vercelPreset } from '@vercel/remix/vite';   // 👈  NEW
import UnoCSS from 'unocss/vite';
import { defineConfig, type ViteDevServer } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { optimizeCssModules } from 'vite-plugin-optimize-css-modules';
import tsconfigPaths from 'vite-tsconfig-paths';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig((config) => ({
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  build: {
    target: 'esnext',
  },
  plugins: [
    nodePolyfills({
      include: ['buffer', 'process', 'util', 'stream'],
      globals: { Buffer: true, process: true, global: true },
      protocolImports: true,
      exclude: ['child_process', 'fs', 'path'],
    }),
    {
      name: 'buffer-polyfill',
      transform(code, id) {
        if (id.includes('env.mjs')) {
          return { code: `import { Buffer } from 'buffer';\n${code}`, map: null };
        }
        return null;
      },
    },

    // 🚀  Tell Remix to build for Vercel Functions
    remix({
      presets: [vercelPreset()],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
      },
    }),

    UnoCSS(),
    tsconfigPaths(),
    chrome129IssuePlugin(),
    config.mode === 'production' && optimizeCssModules({ apply: 'build' }),
  ].filter(Boolean),
  envPrefix: [
    'VITE_',
    'OPENAI_LIKE_API_BASE_URL',
    'OLLAMA_API_BASE_URL',
    'LMSTUDIO_API_BASE_URL',
    'TOGETHER_API_BASE_URL',
  ],
  css: {
    preprocessorOptions: {
      scss: { api: 'modern-compiler' },
    },
  },
}));

function chrome129IssuePlugin() {
  return {
    name: 'chrome129IssuePlugin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        const raw = req.headers['user-agent']?.match(/Chrom(e|ium)\/([0-9]+)\./);
        if (raw) {
          const v = parseInt(raw[2], 10);
          if (v === 129) {
            res.setHeader('content-type', 'text/html');
            res.end(
              '<body><h1>Please use Chrome Canary for testing.</h1><p>Chrome 129 has an issue with JS modules & Vite. See <a href="https://github.com/stackblitz/bolt.new/issues/86#issuecomment-2395519258" target="_blank">details</a>.</p></body>',
            );
            return;
          }
        }
        next();
      });
    },
  };
}