// Root Prettier config for the monorepo
// Applies to all packages unless a closer config exists
export default {
  printWidth: 100,
  singleQuote: true,
  overrides: [
    {
      files: '*.html',
      options: {
        parser: 'angular',
      },
    },
  ],
};
