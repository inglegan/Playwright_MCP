// @ts-check
import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/homePage.js';
import { LoginPage } from '../pages/loginPage.js';
import { createTestUser } from './testData.js';

/** @typedef {{ homePage: HomePage, loginPage: LoginPage, registeredUser: { name: string, email: string, password: string } }} LoginFixtures */

/** @type {import('@playwright/test').TestType<LoginFixtures, {}>} */
export const test = base.extend({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  registeredUser: async ({ page, homePage, loginPage }, use) => {
    const user = createTestUser('login-fixture');

    await homePage.visit();
    await expect(page).toHaveTitle(/Automation Exercise/);
    await homePage.goToLogin();
    await expect(page.getByRole('heading', { name: 'New User Signup!' })).toBeVisible();

    await loginPage.register(user.name, user.email, {
      password: user.password,
      firstName: 'Usuario',
      lastName: 'Prueba',
      address: 'Calle Login 123',
      city: 'Bogotá',
      state: 'Cundinamarca',
      zipcode: '110111',
      country: 'India',
      mobileNumber: '3001234567',
    });
    await expect(page.getByRole('heading', { name: /Account Created!/i })).toBeVisible();

    await loginPage.clickContinue();
    await expect(page.getByText(/Logged in as/i)).toBeVisible();

    await page.goto('https://www.automationexercise.com/logout');
    await homePage.goToLogin();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();

    await use(user);
  },
});

export { expect };