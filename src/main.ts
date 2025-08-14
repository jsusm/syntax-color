import { highlight } from '../lib/main'
import { javascriptSM } from '../lib/parsers/javascript.ts'

const code = `const a = { hello, world, this   : 123, a value}`
console.log(highlight(code, javascriptSM, 'initial'))
