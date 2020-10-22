export default {
  // The start state contains the rules that are intially used
  start: [
    // The regex matches the token, the token property contains the type
    // You can match multiple tokens at once. Note that the captured
    // groups must span the whole string in this case
    // { regex: /(%{)([^:]+)(:?)([^}]+)(})/, token: [null, 'keyword', null, 'string', null] },
    // Rules are matched in the order in which they ap
    { regex: /(%{)([^:}]+)(})/, token: ['def', 'operator', 'def'] },
    { regex: /(%{)([^:}]+)(:)([^}]+)(})/, token: ['def', 'operator', 'def', 'keyword', 'def'] },
    { regex: /(\\)([\[|\.|\^|\$|\*|\+|\?|\(|\)|\[|\{|\\|\||\]])/, token: ['qualifier', null] },
    { regex: /(\()(\?)(<)([^>]+)(>)/, token: [null, 'def', 'def', 'keyword', 'def'] },
  ],
  // The meta property contains global information about the mode. It
  // can contain properties like lineComment, which are supported by
  // all modes, and also directives like dontIndentStates, which are
  // specific to simple modes.
  meta: {},
};
