# `ngServerMode` is `false` in the server environment of an Environment API build

> 🤖 Made by agents

`@oxc-angular/vite@0.0.43`, Angular 22.2.5, Vite 8.3.4, Node 22+.

`vite.config.ts` has one config with a `client` and an `ssr` environment.
`vite build --app` builds both from that config, as TanStack Start, Nitro and
`builder.buildApp` do. `src/client.ts` and `src/server.ts` print the
`ngServerMode` they were built with, and the server entry bundles
`createPlatform` from `@angular/core` (`ssr.noExternal`), so the define also
reaches Angular's own code.

## Quick run

```sh
npm install
npm run repro            # vite build --app: the server bundle gets ngServerMode = false
npm run repro:ssr-only   # vite build --ssr: the server bundle gets ngServerMode = true
```

## Step by step

1. Install the pinned dependencies.

   ```sh
   npm install
   ```

2. Build both environments from the one config.

   ```sh
   npm run build
   ```

   ```
   vite v8.3.4 building client environment for production...
   vite v8.3.4 building ssr environment for production...
   ```

3. Look at the `ngServerMode` each bundle was built with.

   ```sh
   grep -h "ngServerMode:" dist/client/assets/*.js dist/server/server.js
   ```

   ```
   console.log("client ngServerMode:", false);
   console.log("server ngServerMode:", false);
   ```

   The server bundle should get `true`, as the Angular CLI does for its
   server bundle.

4. Look at `createPlatform`, bundled from `@angular/core` into the server.

   ```sh
   grep -A4 "^function createPlatform" dist/server/server.js
   ```

   ```js
   function createPlatform(injector) {
   	if (getPlatform()) throw new RuntimeError(400, false);
   	_platformInjector = injector;
   	const platform = injector.get(PlatformRef);
   	runPlatformInitializers(injector);
   ```

   With `ngServerMode = true`, Angular keeps no process-wide platform
   (`_platformInjector = null`). Here every request shares one.

5. Compare with a separate server build, the older model the plugin handles.

   ```sh
   npm run repro:ssr-only
   ```

   ```
   server bundle ngServerMode: true
   OK: the server bundle runs Angular in server mode
   ```

## Why it fails

The build optimizer plugin computes `ngServerMode` once, in its `config`
hook, from `userConfig.build?.ssr`, and returns it in the top-level `define`
(and `oxc.define`). With the Environment API, `build.ssr` is not set at the
top level, so every environment, the server one included, gets
`ngServerMode = false`.

Angular either leaves `ngServerMode` undefined until `platformServer()` sets
it to `true`, or (Angular CLI) defines it per bundle. `false` on the server
makes `createPlatform()` keep a process-wide platform injector and run
`afterRender` hooks on the server. With concurrent requests, one request's
`PlatformRef.destroy` breaks the others (`NG0404`), and `afterRenderEffect`s
that touch `document` throw during prerendering.
