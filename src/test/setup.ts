import { afterAll, beforeAll, vi } from "vitest";

// Suppress console.error and console.warn in tests to reduce noise
// Tests can still spy on these methods if they need to verify error handling
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
