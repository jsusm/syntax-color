import { highlight } from '../lib/main'
import { javascriptSM } from '../lib/parsers/javascript.ts'

const code = `//this is a comment
const a = "hello world" const// comment
// this is another comment
/* this is another
* block comment
* and this is multiline
*/
function foo(){
console.log("fuck")
}`
console.log(highlight(code, javascriptSM, 'initial'))
