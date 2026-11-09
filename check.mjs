// Prints the `ngServerMode` each bundle was built with, and whether the
// `createPlatform` bundled from @angular/core keeps the process-wide platform
// injector, which Angular only does in the browser.
import { readdirSync, readFileSync } from 'node:fs'

const clientDir = 'dist/client/assets'
const client = readFileSync(`${clientDir}/${readdirSync(clientDir)[0]}`, 'utf8')
const server = readFileSync('dist/server/server.js', 'utf8')
const value = (code, side) => code.match(new RegExp(`"${side} ngServerMode:", (\\w+)`))?.[1]

console.log('client bundle ngServerMode:', value(client, 'client'))
console.log('server bundle ngServerMode:', value(server, 'server'))
const createPlatform = server.match(/function createPlatform\(injector\) \{[^]*?\n\}/)[0]
console.log('\nserver bundle createPlatform:\n' + createPlatform)
console.log(
  value(server, 'server') === 'true'
    ? '\nOK: the server bundle runs Angular in server mode'
    : '\nBUG: the server bundle has ngServerMode = false, so Angular keeps a process-wide platform injector',
)
