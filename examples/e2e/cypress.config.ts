import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,
  e2e: {
    baseUrl:
      process.env.CYPRESS_BASE_URL ||
      process.env.BASE_URL ||
      'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.{js,ts,jsx,tsx}',
    supportFile: 'cypress/support/e2e.ts',
  },
});
