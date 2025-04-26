export default {
  transform: {
    "^.+\\.(js|jsx|mjs)$": "babel-jest", // This tells Jest to use Babel for transforming JS files
  },
  testEnvironment: "node", // Ensures Jest uses Node.js environment for backend testing
  setupFiles: ["<rootDir>/jest.setup.js"], // Point to your setup file
};
