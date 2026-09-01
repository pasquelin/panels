import '@testing-library/jest-dom/vitest'

// jsdom draws nothing and captures nothing: the handles call these on every pointer down, and
// without them a drag in a test dies on a missing method rather than on what it asserts.
for (const method of ['setPointerCapture', 'releasePointerCapture'] as const) {
  if (!(method in Element.prototype)) {
    Object.defineProperty(Element.prototype, method, { value: () => {}, configurable: true })
  }
}
