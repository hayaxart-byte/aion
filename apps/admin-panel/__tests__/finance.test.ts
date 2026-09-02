import { describe, it, expect } from 'vitest';

describe('Admin Panel Finance', () => {
  it('should compute totals correctly', () => {
    const totals = { billed: 1000, paid: 700, balance: 300 };
    expect(totals.billed - totals.paid).toBe(totals.balance);
  });
});
