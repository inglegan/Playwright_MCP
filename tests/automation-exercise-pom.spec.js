// @ts-check
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/homePage.js';
import { LoginPage } from '../pages/loginPage.js';
import { ProductsPage } from '../pages/productsPage.js';
import { CartPage } from '../pages/cartPage.js';
import { generateEmail } from '../fixtures/testData.js';

/** @param {import('@playwright/test').Page} page */
const waitForLoggedIn = async (page) => {
  await expect(page.locator('body')).toContainText(/Logged in as/i);
};

test.describe.serial('Automation Exercise - POM', () => {
  test('1. prueba de usuario registrado', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const email = generateEmail('registro');

    await homePage.visit();
    await homePage.goToLogin();
    await loginPage.register('Usuario Registro', email, {
      firstName: 'Usuario',
      lastName: 'Registro',
      address: 'Calle Registro 123',
      city: 'Bogotá',
      state: 'Cundinamarca',
      zipcode: '110111',
      country: 'India',
      mobileNumber: '3001234567',
    });

    await expect(page.locator('h2[data-qa="account-created"]')).toContainText('Account Created!');
    await loginPage.clickContinue();
    await waitForLoggedIn(page);
  });

  test('2. prueba de login', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const email = generateEmail('login');

    await homePage.visit();
    await homePage.goToLogin();
    await loginPage.register('Usuario Login', email, {
      firstName: 'Usuario',
      lastName: 'Login',
      address: 'Calle Login 456',
      city: 'Medellín',
      state: 'Antioquia',
      zipcode: '050001',
      country: 'India',
      mobileNumber: '3209876543',
    });
    await loginPage.clickContinue();

    await page.goto('https://www.automationexercise.com/logout');
    await homePage.visit();
    await homePage.goToLogin();
    await loginPage.login(email, 'Password123');

    await waitForLoggedIn(page);
  });

  test('3. prueba de categoria women', async ({ page }) => {
    const homePage = new HomePage(page);
    const productsPage = new ProductsPage(page);

    await homePage.visit();
    await productsPage.openCategory('https://www.automationexercise.com/category_products/1');
    await expect(page).toHaveURL(/category_products\/1/);
    await expect(page.locator('.product-image-wrapper')).toHaveCount(3);
  });

  test('4. prueba de agregar productos categoria women', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);

    await productsPage.addProductsFromCategory('https://www.automationexercise.com/category_products/1', 1);
    await productsPage.addProductsFromCategory('https://www.automationexercise.com/category_products/2', 1);
    await productsPage.addProductsFromCategory('https://www.automationexercise.com/category_products/7', 1);

    await cartPage.open();
    await expect(page.locator('body')).toContainText(/Blue Top|Sleeveless Dress|Cotton Silk Hand Block Print Saree/i);
  });

  test('5. prueba de categoria men', async ({ page }) => {
    const homePage = new HomePage(page);
    const productsPage = new ProductsPage(page);

    await homePage.visit();
    await productsPage.openCategory('https://www.automationexercise.com/category_products/3');
    await expect(page).toHaveURL(/category_products\/3/);
    await expect(page.locator('.product-image-wrapper')).toHaveCount(6);
  });

  test('6. prueba de agregar productos categoria men', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);

    await productsPage.addProductsFromCategory('https://www.automationexercise.com/category_products/3', 2);
    await productsPage.addProductsFromCategory('https://www.automationexercise.com/category_products/6', 1);

    await cartPage.open();
    await expect(page.locator('body')).toContainText(/Men Tshirt|Soft Stretch Jeans/i);
  });

  test('7. prueba de categoria kids', async ({ page }) => {
    const homePage = new HomePage(page);
    const productsPage = new ProductsPage(page);

    await homePage.visit();
    await productsPage.openCategory('https://www.automationexercise.com/category_products/5');
    await expect(page).toHaveURL(/category_products\/5/);
    await expect(page.locator('.product-image-wrapper')).toHaveCount(7);
  });

  test('8. prueba de agregar productos categoria kids', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);

    await productsPage.addProductsFromCategory('https://www.automationexercise.com/category_products/4', 2);
    await productsPage.addProductsFromCategory('https://www.automationexercise.com/category_products/5', 1);

    await cartPage.open();
    await expect(page.locator('body')).toContainText(/Sleeves Top and Short|Sleeves Printed Top/i);
  });

  test('9. prueba de checkout', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    const email = generateEmail('checkout');

    await homePage.visit();
    await homePage.goToLogin();
    await loginPage.register('Usuario Checkout', email, {
      firstName: 'Usuario',
      lastName: 'Checkout',
      address: 'Calle Checkout 789',
      city: 'Barranquilla',
      state: 'Atlántico',
      zipcode: '080001',
      country: 'India',
      mobileNumber: '3105556677',
    });
    await loginPage.clickContinue();
    await waitForLoggedIn(page);

    await productsPage.addProductsFromCategory('https://www.automationexercise.com/category_products/1', 1);
    await productsPage.addProductsFromCategory('https://www.automationexercise.com/category_products/2', 1);
    await cartPage.open();
    await cartPage.proceedToCheckout();

    await expect(page).toHaveURL(/\/checkout$/);
  });
});
