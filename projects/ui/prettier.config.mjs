// Prettier config for the Angular UI package
// Includes organize-imports plugin installed in this package
export default {
  printWidth: 100,
  singleQuote: true,
  plugins: ['prettier-plugin-organize-imports'],
  overrides: [
    {
      files: '*.html',
      options: {
        parser: 'angular',
      },
    },
  ],
};
