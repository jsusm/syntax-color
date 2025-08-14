import type { SM } from '../main.ts'

const span = (className: string, content: string) => `<span class="${className}">${content}</span>`

const space = /\s/

const KEYWORDS = [
  "as", // for exports
  "in",
  "of",
  "if",
  "for",
  "while",
  "finally",
  "var",
  "new",
  "function",
  "do",
  "return",
  "void",
  "else",
  "break",
  "catch",
  "instanceof",
  "with",
  "throw",
  "case",
  "default",
  "try",
  "switch",
  "continue",
  "typeof",
  "delete",
  "let",
  "yield",
  "const",
  "class",
  // JS handles these with a special rule
  // "get",
  // "set",
  "debugger",
  "async",
  "await",
  "static",
  "import",
  "from",
  "export",
  "extends",
  // It's reached stage 3, which is "recommended for implementation":
  "using"
];

const LITERALS = [
  'null',
  'true',
  'false',
  'undefined',
]

const NUMBER_LITERALS = [
  'NaN',
  'Infinity'
]

const numberSM: SM = {
  'number': {
    transitions: [
      {
        p: ['o', 'O'],
        s: '0',
        to: 'number-octal',
      },
      {
        p: ['x', 'X'],
        s: '0',
        to: 'number-hex',
      },
      {
        p: ['b', 'B'],
        s: '0',
        to: 'number-bin',
      },
      {
        p: 'e',
        to: 'number-exponent-sign',
      },
      {
        p: /\d/,
        to: 'number',
      },
      {
        p: /\D/,
        to: 'initial',
        out: s => span('number', s),
        stop: true,
      }
    ]
  },
  'number-exponent-sign': {
    transitions: [
      {
        p: ['+', '-'],
        to: 'number-exponent'
      },
      {
        p: /\d/,
        to: 'number-exponent'
      },
    ]
  },
  'number-exponent': {
    transitions: [
      {
        p: /\d/,
        to: 'number-exponent',
      },
      {
        p: '',
        to: 'initial',
        out: s => span('number', s),
        stop: true,
      }
    ]
  },
  'number-octal': {
    transitions: [
      {
        p: /\d/,
        to: 'number-octal',
      },
      {
        p: '',
        to: 'initial',
        out: s => span('number number-octal', s),
        stop: true,
      }
    ]
  },
  'number-hex': {
    transitions: [
      {
        p: /[0-9A-Fa-f]/,
        to: 'number-hex',
      },
      {
        p: '',
        to: 'initial',
        out: s => span('number number-hex', s),
        stop: true,
      }
    ]
  },

  'number-bin': {
    transitions: [
      {
        p: /[01]/,
        to: 'number-bin',
      },
      {
        p: '',
        to: 'initial',
        out: s => span('number number-bin', s),
        stop: true,
      }
    ]
  },
}

const identifierStart = /[A-Za-z_]/


const functionDefinition: SM = {
  'function-definition': {
    transitions: [
      {
        p: space,
        out: s => s,
        stop: false,
        stackBefore: true,
        to: 'function-definition',
      },
      {
        p: identifierStart,
        to: 'function-definition-name',
      },
      {
        p: '',
        out: s => s,
        stop: true,
        to: 'initial',
      }
    ],
  },
  'function-definition-name': {
    transitions: [
      {
        p: /\w/,
        to: 'function-definition-name',
      },
      {
        p: space,
        to: 'function-definition-pre-parameters',
        out: s => span('function-name', s),
        stop: false,
        stackBefore: false,
      },
      {
        p: '(',
        out: s => span('function-name', s),
        stop: false,
        stackBefore: false,
        to: 'function-definition-parameters',
      },
      {
        p: '',
        out: s => s,
        stop: true,
        to: 'initial'
      }
    ]
  },
  'function-definition-pre-parameters': {
    transitions: [
      {
        p: space,
        to: 'function-definition-pre-parameters',
      },
      {
        p: '(',
        out: s => span('function-name', s),
        stop: false,
        stackBefore: false,
        to: 'function-definition-parameters',
      },
      {
        p: '',
        out: s => s,
        stop: true,
        to: 'initial'
      }
    ]
  },
  'function-definition-parameters': {
    transitions: [
      {
        p: ')',
        out: s => s,
        stop: false,
        stackBefore: true,
        to: 'function-body-start',
      },
      {
        p: /[\w,\s]/,
        to: 'function-definition-parameters',
      },
      {
        p: '',
        to: 'initial',
      }
    ]
  },
  'function-body-start': {
    transitions: [
      {
        p: space,
        to: 'function-body-start',
      },
      {
        p: '{',
        to: 'initial',
        out: s => s,
        stop: false,
        stackBefore: true,
      },
      {
        p: '',
        to: 'initial'
      }
    ]
  },
}

export const javascriptSM: SM = {
  'initial': {
    transitions: [
      {
        p: identifierStart,
        s: '',
        to: 'word',
        stop: true,
        out: s => s
      },
      {
        p: /[A-Za-z_]/,
        s: s => s == '+' || s == '-',
        to: 'word',
        stop: true,
        out: s => s
      },
      {
        p: /\d/,
        s: s => s == '+' || s == '-' || true,
        to: 'number',
      },
      {
        p: '{',
        out: s => s,
        stop: false,
        stackBefore: true,
        to: 'initial',
        stackScope: 'object'
      },
      {
        p: ':',
        out: s => s,
        scopeCond: 'object',
        stackScope: 'object-value',
        stop: true,
        to: 'initial'
      },
      {
        p: ',',
        out: s => s,
        stop: false,
        stackBefore: true,
        scopeCond: 'object-value',
        to: 'initial',
        unstackScope: true,
      },
      {
        p: '}',
        out: s => s,
        stop: false,
        stackBefore: true,
        to: 'initial',
        unstackScope: true,
        scopeCond: 'object',
      },
      {
        p: '\'',
        to: 'single-cuote-string',
      },
      {
        p: '\"',
        to: 'double-cuote-string',
      },
      {
        p: '\`',
        to: 'template-literal-string',
        stackScope: 'template-literal',
      },
      {
        p: '}',
        scopeCond: 'template-literal-content',
        to: 'template-literal-string',
        out: s => s,
        stop: true,
      },
      {
        p: '/',
        s: '',
        to: 'initial',
      },
      {
        p: '/',
        s: '/',
        to: 'inline-comment',
        stackScope: 'comment',
      },
      {
        p: '*',
        s: '/',
        to: 'block-comment',
        stackScope: 'comment-block',
      },
      {
        p: /[+-]/,
        to: 'initial',
      },
      {
        p: '',
        out: s => s,
        stop: false,
        stackBefore: true,
        to: 'initial',
      }
    ]
  },
  'inline-comment': {
    eobHightliht: s => span('comment', s),
    transitions: [
      {
        p: '\n',
        to: 'initial',
        unstackScope: true,
        out: s => span('comment', s),
        stop: true,
      },
      {
        p: '',
        to: 'inline-comment',
      }
    ]
  },
  'block-comment': {
    eobHightliht: s => span('comment block-comment', s),
    transitions: [
      {
        p: '/',
        s: s => s.endsWith('*'),
        to: 'initial',
        unstackScope: true,
        out: s => span('comment block-comment', s),
        stop: false,
        stackBefore: true,
      },
      {
        p: '',
        to: 'block-comment',
      }
    ]
  },
  'word': {
    eobHightliht: s => KEYWORDS.includes(s) ? span('keyword', s) :
      LITERALS.includes((s)) ? span('literal', s) :
        NUMBER_LITERALS.includes(s) ? span('literal number-literal', s) : s,
    transitions: [
      {
        p: /\w/,
        to: 'word',
      },
      {
        p: '',
        s: LITERALS,
        out: s => span('literal', s),
        stop: true,
        to: 'initial',
      },
      {
        p: '',
        s: NUMBER_LITERALS,
        out: s => span('literal number-literal', s),
        stop: true,
        to: 'initial',
      },
      {
        p: '',
        s: 'function',
        out: s => span('keyword', s),
        stop: true,
        to: 'function-definition',
      },
      {
        p: '',
        s: KEYWORDS,
        out: s => span('keyword', s),
        stop: true,
        to: 'initial',
      },
      {
        p: '(',
        out: s => span('functionCall', s),
        stop: true,
        to: 'initial'
      },
      {
        p: ':',
        out: s => span('object-label', s),
        scopeCond: 'object',
        stackScope: 'object-value',
        stop: true,
        to: 'initial'
      },
      {
        p: space,
        to: 'functionCall?'
      },
      {
        p: '',
        out: s => s,
        stop: true,
        to: 'initial',
      }
    ]
  },
  'template-literal-string': {
    eobHightliht: s => span('string template-literal', s),
    transitions: [
      {
        p: '\`',
        to: 'initial',
        unstackScope: true,
        out: s => span('string template-literal', s),
        stop: false,
        stackBefore: true,
      },
      {
        p: '{',
        s: s => s.endsWith('$'),
        out: s => span('string', s.slice(0, -2) + span('template-literal-delim', '${')),
        stop: false,
        stackBefore: true,
        stackScope: 'template-literal-content',
        to: 'initial',
      },
      {
        p: '}',
        out: s => span('template-literal-delim', s),
        scopeCond: 'template-literal-content',
        unstackScope: true,
        stop: false,
        stackBefore: true,
        to: 'template-literal-string',
      },
      {
        p: '',
        to: 'template-literal-string',
      },
    ],
  },
  'single-cuote-string': {
    eobHightliht: s => span('string', s),
    transitions: [
      {
        p: '\'',
        to: 'initial',
        unstackScope: true,
        out: s => span('string', s),
        stop: false,
        stackBefore: true,
      },
      {
        p: '',
        to: 'single-cuote-string',
      },
    ],
  },
  'double-cuote-string': {
    eobHightliht: s => span('string', s),
    transitions: [
      {
        p: '"',
        out: s => span('string', s),
        stop: false,
        stackBefore: true,
        to: 'initial',
      },
      {
        p: '',
        to: 'double-cuote-string',
      },
    ],
  },
  'functionCall?': {
    transitions: [
      {
        p: space,
        to: 'functionCall?',
      },
      {
        p: identifierStart,
        out: s => s,
        stop: true,
        to: 'word',
      },
      {
        p: '(',
        out: s => span('functionCall', s),
        stop: true,
        to: 'initial'
      },
      {
        p: ':',
        out: s => span('object-label', s),
        stop: true,
        to: 'initial',
        scopeCond: 'object',
        stackScope: 'object-value'
      },
      {
        p: '',
        out: s => s,
        stop: true,
        to: 'initial',
      }
    ]
  },
  ...functionDefinition,
  ...numberSM,
}

