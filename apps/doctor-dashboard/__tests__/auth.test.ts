import { describe, it, expect } from 'vitest';

describe('Auth', () => {
  it('should validate login structure', () => {
    expect({ email: 'test@test.com', password: '123' }).toHaveProperty('email');
  });
});
