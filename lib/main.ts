export type SMTransition = {
  p?: RegExp | ((input: string) => boolean) | string | string[];
  s?: RegExp | ((stack: string) => boolean) | string | string[];
  scopeCond?: string | ((currScope: string) => boolean),
  unstackScope?: boolean,
  to: string;
  stackScope?: string;
} & ({
  out: (stack: string) => string;
  stop: false;
  stackBefore: boolean;
} |
{
  out: (stack: string) => string;
  stop: true;
} | {
  out?: undefined;
})

export type SM = {
  [key: string]: {
    transitions: SMTransition[]
    eobHightliht?: (stack: string) => string;
  },
}

export function highlight(input: string, sm: SM, initialState: string): string {
  let state = initialState;
  let stack = '';
  let scopeStack: string[] = []
  let out = ""

  for (let i = 0; i < input.length; i++) {
    const currChar = input[i];

    let takeTransition = false;

    let stop = false;
    do {
      stop = false;
      for (let j = 0; j < sm[state].transitions.length; j++) {
        const transition = sm[state].transitions[j];
        let p;
        let s;
        let scopeCond = true;

        // Evaluate predicate
        if (transition.p === undefined) p = true;
        else if (typeof transition.p === 'string') p = transition.p === currChar || transition.p === '';
        else if (transition.p instanceof RegExp) p = transition.p.test(currChar)
        else if (typeof transition.p === 'function') p = transition.p(currChar)
        else if (Array.isArray(transition.p)) p = transition.p.includes(currChar);

        // Evaluate stack predicate
        if (transition.s === undefined) s = true;
        else if (typeof transition.s === 'string') s = transition.s === stack;
        else if (transition.s instanceof RegExp) s = transition.s.test(stack)
        else if (typeof transition.s === 'function') s = transition.s(stack)
        else if (Array.isArray(transition.s)) s = transition.s.includes(stack);

        // Evaluate scope condition
        if (typeof transition.scopeCond === 'string') scopeCond = transition.scopeCond === scopeStack[scopeStack.length - 1]
        else if (typeof transition.scopeCond === 'function') scopeCond = transition.scopeCond(scopeStack[scopeStack.length - 1])

        if ((p && s && scopeCond)) {
          takeTransition = true;
          if (process.env.NODE_ENV != 'test') {
            console.log('DEBUG: i:', currChar, ', state: ', state, ', transitionidx: ', j, 'to: ', transition.to, 'stack:', stack)
          }
          // we can take this transition
          if (transition.out) {
            if (transition.stop) {
              stop = transition.stop;
              out = out.concat(transition.out(stack))
              stack = ''
            } else {
              if (transition.stackBefore) {
                stack = stack.concat(currChar)
              }

              out = out.concat(transition.out(stack))
              stack = ''

              if (!transition.stackBefore) {
                stack = stack.concat(currChar)
              }
            }
          } else {
            stack = stack.concat(currChar)
          }

          if (transition.stackScope) {
            scopeStack.push(transition.stackScope)
            state = transition.to;
          } else if (transition.unstackScope) {
            scopeStack.pop()
            state = transition.to;
          } else {
            state = transition.to;
          }
          break;
        }
      }
    } while (stop);
    if (!takeTransition) {
      stack = stack.concat(currChar)
    }
  }

  if (stack.length > 0) {
    const eobHightliht = sm[state].eobHightliht
    if (eobHightliht) {
      out = out.concat(eobHightliht(stack))
    } else {
      out = out.concat(stack)
    }
  }
  return out;
}
