import { defineConfig } from 'vitest/config';

// 1,000-seed simulations run in parallel and pass 5 s on a busy machine.
export default defineConfig({ test: { exclude: ['tests/e2e/**', 'node_modules/**'], testTimeout: 30000 } });
