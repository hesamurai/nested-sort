module.exports = {
  setupFiles: [
    './test/__mocks__/dom.js',
  ],
  restoreMocks: true,
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/',
  ]
}
