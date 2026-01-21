import { describe, it, expect } from 'vitest';

describe('Project Setup', () => {
  it('should have basic TypeScript support', () => {
    const message: string = 'Hello, TypeScript!';
    expect(message).toBe('Hello, TypeScript!');
  });

  it('should support modern JavaScript features', () => {
    const arr = [1, 2, 3];
    const doubled = arr.map(x => x * 2);
    expect(doubled).toEqual([2, 4, 6]);
  });
});
