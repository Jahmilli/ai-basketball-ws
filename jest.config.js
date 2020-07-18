module.exports = {
  coverageDirectory: "build/coverage",
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.json"
    }
  },
  moduleFileExtensions: ["js", "json", "ts"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  testMatch: ["**/*.test.(ts|js)"],
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["test/utils/*"],
  preset: "ts-jest",
};
