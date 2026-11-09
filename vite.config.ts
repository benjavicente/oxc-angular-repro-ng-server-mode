import { angular } from '@oxc-angular/vite'
import { defineConfig } from 'vite'

// One config, two environments. `vite build --app` builds both (the
// Environment API, as TanStack Start, Nitro and `builder.buildApp` use it);
// `vite build --ssr` is the older separate server build.
export default defineConfig({
  plugins: [angular({ tsconfig: 'tsconfig.json' })],
  build: { minify: false },
  ssr: { noExternal: true },
  environments: {
    client: {
      build: { outDir: 'dist/client', rolldownOptions: { input: 'src/client.ts' } },
    },
    ssr: {
      build: { outDir: 'dist/server', rolldownOptions: { input: 'src/server.ts' } },
    },
  },
})
