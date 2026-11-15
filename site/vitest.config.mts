import { defineConfig } from 'vitest/config';

// El motor de Stack Chooser son funciones puras: los tests corren en node, sin DOM.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
