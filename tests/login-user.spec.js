// @ts-check
import { test, expect } from '../fixtures/test.js';
import { createTestUser } from '../fixtures/testData.js';

test.describe('Casos de uso de login', () => {
  test('login exitoso con una cuenta registrada', async ({ page, loginPage, registeredUser }) => {
    await loginPage.login(registeredUser.email, registeredUser.password);

    await expect(page.getByText(`Logged in as ${registeredUser.name}`, { exact: false })).toBeVisible();
  });

  test('login rechazado con un correo no registrado', async ({ page, homePage, loginPage }) => {
    await homePage.visit();
    await expect(page).toHaveTitle(/Automation Exercise/);
    await homePage.goToLogin();
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();

    const unregisteredUser = createTestUser('no-registrado');
    await loginPage.login(unregisteredUser.email, unregisteredUser.password);

    await expect(page.getByText('Your email or password is incorrect!', { exact: true })).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('login rechazado con contraseña incorrecta para una cuenta registrada', async ({ page, loginPage, registeredUser }) => {
    await loginPage.login(registeredUser.email, 'PasswordIncorrecta123');

    await expect(page.getByText('Your email or password is incorrect!', { exact: true })).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});