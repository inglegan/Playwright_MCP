export const TEST_PASSWORD = 'Password123';

export const generateEmail = (prefix = 'login') =>
  `${prefix}.${Date.now()}${Math.floor(Math.random() * 1000)}@example.com`;

export const createTestUser = (prefix = 'login') => ({
  name: `Usuario ${prefix}`,
  email: generateEmail(prefix),
  password: TEST_PASSWORD,
});