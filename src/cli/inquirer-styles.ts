export const checkboxTheme = {
  style: {
    answer: (text: string) => ' ' + text,
    message: (text: string) => text,
    error: (text: string) => text,
    defaultAnswer: (text: string) => text,
    help: () => '',
    highlight: (text: string) => text,
    key: (text: string) => text,
    disabledChoice: (text: string) => text,
    description: (text: string) => text,
  },
  prefix: '\uf02d',
  icon: { checked: ' 󱓻 ', unchecked: ' 󱓼 ' },
  helpMode: 'never',
}

export const inputTheme = {
  prefix: '\uf002',
  style: {
    answer: (s: string) => s,
    message: (s: string) => s,
    error: (s: string) => s,
    defaultAnswer: (s: string) => `\x1b[2m${s}\x1b[0m`,
  },
}

export const listTheme = {
  style: {
    answer: (text: string) => ' ' + text,
    message: (text: string) => text,
    error: (text: string) => text,
    defaultAnswer: (text: string) => text,
    help: () => '',
    highlight: (text: string) => text,
    key: (text: string) => text,
    disabledChoice: (text: string) => text,
    description: (text: string) => text,
  },
  prefix: '\udb84\udc64',
  helpMode: 'never',
}
