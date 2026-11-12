
import { defineConfig } from 'vite';

const config = {
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
  },
};

export default defineConfig(config);
