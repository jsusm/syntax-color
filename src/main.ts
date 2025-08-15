import { highlight } from '../lib/main'
import { javascriptSM } from '../lib/parsers/javascript.ts'

const code = `const from = "this should not be highlighted"
const as = 123
const exported = from + as

export { from } from "./lib/main"
from.toLowerCase();
export exported as _exported;
export default function from() {
  // this is a dummy function
}
`
console.log(highlight(code, javascriptSM, 'initial'))
