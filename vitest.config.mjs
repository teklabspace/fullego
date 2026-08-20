import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Unit tests cover the pure validation layer only. Nothing here touches Next's
// build — `npm run build` still runs the static export untouched.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
  },
});
