// `ngServerMode` is the global Angular reads to know it runs on the server.
declare const ngServerMode: boolean | undefined

console.log('server ngServerMode:', ngServerMode)

// Bundled into the server environment (`ssr.noExternal`), so the define also
// applies inside @angular/core.
export { createPlatform } from '@angular/core'
