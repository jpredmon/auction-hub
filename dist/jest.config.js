// const nextJest = require('next/jest')
// const createJestConfig = nextJest({
//   // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
//   dir: './',
// })
// // Add any custom config to be passed to Jest
// const config = {
//   //coverageProvider: 'v8',
//   testEnvironment: 'jest-environment-jsdom',
//   // Add more setup options before each test is run
//   setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
//   preset: 'ts-jest',
// }
// // createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
// module.exports = createJestConfig(config)
import nextJest from 'next/jest';
const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
});
// Add any custom config to be passed to Jest
const config = {
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['./jest.setup.ts'],
    preset: 'ts-jest',
};
// Export the Jest configuration
export default createJestConfig(config);