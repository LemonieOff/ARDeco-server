/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: [
    "js",
    "json",
    "ts"
  ],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  collectCoverageFrom: [
    "**/*.(t|j)s"
  ],
  coveragePathIgnorePatterns: [
    "node_modules",
    "test-config",
    "interfaces",
    "jestGlobalMocks.ts",
    ".module.ts",
    "<rootDir>/main.ts",
    ".mock.ts",
    ".entity.ts",
    ".dto.ts"
  ],
  coverageDirectory: "../coverage",
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  }
};
