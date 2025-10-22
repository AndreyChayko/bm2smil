// Prettier config for the Node/Express server package
// Focused on TypeScript backend code (no Angular/HTML overrides here)
/** @type {import('prettier').Config} */
export default {
  // Keep diffs small and code consistent across the backend
  printWidth: 100,
  singleQuote: true,
  trailingComma: 'all',
  semi: true,
  arrowParens: 'always',
  endOfLine: 'lf',
};
