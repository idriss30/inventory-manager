module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: [
    "<rootDir>/setupGlobalFetch.js",
    "<rootDir>/setupJestDom.js",
  ],
};
