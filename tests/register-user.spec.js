// @ts-check
import { test, expect } from '@playwright/test';
import { CartPage } from '../pages/cartPage.js';
import { ProductsPage } from '../pages/productsPage.js';
import { generateEmail } from '../fixtures/testData.js';

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} name
 * @param {string} email
 */
const fillRegistrationForm = async (page, name, email) => {
  await page.goto('https://www.automationexercise.com/');
  await expect(page).toHaveTitle(/Automation Exercise/);

  await page.locator('a[href="/login"]').click();
  await page.waitForURL('**/login');

  await page.locator('input[data-qa="signup-name"]').fill(name);
  await page.locator('input[data-qa="signup-email"]').fill(email);
  await page.locator('button[data-qa="signup-button"]').click();

  await expect(page.getByRole('heading', { name: 'Enter Account Information' })).toBeVisible();

  await page.locator('input[id="id_gender1"]').check();
  await page.locator('input[data-qa="password"]').fill('Password123');
  await page.locator('select[data-qa="days"]').selectOption('15');
  await page.locator('select[data-qa="months"]').selectOption('5');
  await page.locator('select[data-qa="years"]').selectOption('1995');

  await page.locator('input[data-qa="first_name"]').fill('Juan');
  await page.locator('input[data-qa="last_name"]').fill('Pérez');
  await page.locator('input[data-qa="address"]').fill('Calle Falsa 123');
  await page.locator('input[data-qa="city"]').fill('Madrid');
  await page.locator('input[data-qa="state"]').fill('Madrid');
  await page.locator('input[data-qa="zipcode"]').fill('28001');
  await page.locator('select[data-qa="country"]').selectOption({ label: 'India' });
  await page.locator('input[data-qa="mobile_number"]').fill('612345678');

  await page.locator('button[data-qa="create-account"]').click();
};

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} categoryUrl
 * @param {number} [quantity]
 */
const addProductsFromCategory = async (page, categoryUrl, quantity = 1) => {
  await new ProductsPage(page).addProductsFromCategory(categoryUrl, quantity, true);
};

test('registro de usuario exitoso', async ({ page }) => {
  const email = generateEmail('juan.prueba');
  await fillRegistrationForm(page, 'Juan Pérez', email);

  await expect(page.locator('h2[data-qa="account-created"]')).toContainText('Account Created!');

  await page.locator('a:has-text("Continue")').click();
  await expect(page.locator('body')).toContainText('Logged in as');
});

test.describe('Registro de usuario - versión Gherkin', () => {
  test('Dado un usuario nuevo, cuando completa el formulario con datos válidos, entonces se crea su cuenta', async ({ page }) => {
    const email = generateEmail('gherkin');
    await fillRegistrationForm(page, 'Gherkin User', email);

    await expect(page.locator('h2[data-qa="account-created"]')).toContainText('Account Created!');

    await page.locator('a:has-text("Continue")').click();
    await expect(page.locator('body')).toContainText(/Logged in as/i);
  });

  test('Dado un correo ya registrado, cuando intenta crear otra cuenta con el mismo email, entonces muestra el mensaje de error', async ({ page }) => {
    const email = generateEmail('duplicado');

    await fillRegistrationForm(page, 'Duplicado User', email);
    await expect(page.locator('h2[data-qa="account-created"]')).toContainText('Account Created!');

    await page.locator('a:has-text("Continue")').click();
    await page.goto('https://www.automationexercise.com/logout');
    await page.goto('https://www.automationexercise.com/login');

    await page.locator('input[data-qa="signup-name"]').fill('Duplicado User 2');
    await page.locator('input[data-qa="signup-email"]').fill(email);
    await page.locator('button[data-qa="signup-button"]').click();

    await expect(page.locator('body')).toContainText(/Email Address already exist!/i);
  });
});

test.describe('Registro de usuario - versión validación email inválido', () => {
  test('Dado un email inválido, cuando intenta registrarse, entonces no crea la cuenta y se mantiene en la pantalla de login', async ({ page }) => {
    await page.goto('https://www.automationexercise.com/');
    await expect(page).toHaveTitle(/Automation Exercise/);

    await page.locator('a[href="/login"]').click();
    await page.waitForURL('**/login');

    await page.locator('input[data-qa="signup-name"]').fill('Email Inválido');
    await page.locator('input[data-qa="signup-email"]').fill('email-invalido');
    await page.locator('button[data-qa="signup-button"]').click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('h2[data-qa="account-created"]')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText('Account Created!');
  });
});

test('registro de usuario exitoso y compra por categorías', async ({ page }) => {
  const email = generateEmail('compra.categorias');
  await fillRegistrationForm(page, 'Cliente Compra', email);

  await expect(page.locator('h2[data-qa="account-created"]')).toContainText('Account Created!');
  await page.locator('a:has-text("Continue")').click();

  await addProductsFromCategory(page, 'https://www.automationexercise.com/category_products/1', 1);
  await addProductsFromCategory(page, 'https://www.automationexercise.com/category_products/2', 1);
  await addProductsFromCategory(page, 'https://www.automationexercise.com/category_products/7', 1);

  await addProductsFromCategory(page, 'https://www.automationexercise.com/category_products/3', 2);
  await addProductsFromCategory(page, 'https://www.automationexercise.com/category_products/6', 1);

  await addProductsFromCategory(page, 'https://www.automationexercise.com/category_products/4', 1);
  await addProductsFromCategory(page, 'https://www.automationexercise.com/category_products/5', 2);

  const cartPage = new CartPage(page);
  await cartPage.open();
  await cartPage.proceedToCheckout();

  await expect(page).toHaveURL(/\/checkout$/);
});
