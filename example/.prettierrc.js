module.exports = {
  useTabs: false,
  // Number of spaces per indentation level.
  // tabWidth: 2,
  tabWidth: 2,
  // Print semicolons.  semi: true,
  // The line length where Prettier will try wrap.
  printWidth: 120,
  // Use single quotes instead of double quotes.
  singleQuote: true,
  // Include parentheses around a sole arrow function parameter.
  arrowParens: 'avoid',

  // Print semicolons at the ends of statements.
  semi: true,

  // Print spaces between brackets.
  bracketSpacing: true,
  // Print trailing commas wherever possible when multi-line.
  trailingComma: 'es5',
  // Put > on the new line instead of at last line.
  jsxBracketSameLine: false,
  // Use single quotes in JSX.
  jsxSingleQuote: true,
  // How to handle whitespaces in HTML.
  htmlWhitespaceSensitivity: 'css',
  // How to wrap prose.
  proseWrap: 'always',
  overrides: [
    {
      files: '*.wxml',
      options: {
        parser: 'html',
      },
    },
    {
      files: '*.json',
      options: { parser: 'json' },
    },
  ],
}
