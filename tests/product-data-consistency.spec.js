// @ts-check
import { test, expect } from '@playwright/test';

const apiUrl = 'https://www.automationexercise.com/api/productsList';
const productsPageUrl = 'https://www.automationexercise.com/products';

const normalizeText = (value) =>
  value.normalize('NFKC').replace(/\s+/gu, ' ').trim().toLocaleLowerCase();

const findDuplicateIds = (products) => {
  const seen = new Set();
  const duplicates = new Set();

  for (const product of products) {
    if (seen.has(product.id)) {
      duplicates.add(product.id);
    }
    seen.add(product.id);
  }

  return [...duplicates];
};

test('Cruce de catálogo: productos visibles en la página contra API', async ({ page, request }) => {
  const apiResponse = await request.get(apiUrl);
  expect(apiResponse.status()).toBe(200);

  const apiBody = await apiResponse.json();
  expect(apiBody.responseCode).toBe(200);
  expect(apiBody.products).toBeInstanceOf(Array);

  await page.goto(productsPageUrl, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible();

  const productCards = page.locator('.product-image-wrapper');
  await expect(productCards.first()).toBeVisible();

  const uiProducts = await productCards.evaluateAll((cards) => cards.map((card) => ({
    id: card.querySelector('a.add-to-cart[data-product-id]')?.getAttribute('data-product-id') ?? '',
    name: card.querySelector('.productinfo p')?.textContent ?? '',
    price: card.querySelector('.productinfo h2')?.textContent ?? '',
  })));

  const apiProducts = apiBody.products.map((product) => ({
    id: String(product.id),
    name: String(product.name),
    price: String(product.price),
  }));
  const apiById = new Map(apiProducts.map((product) => [product.id, product]));
  const uiById = new Map(uiProducts.map((product) => [product.id, product]));
  const discrepancies = [];

  for (const id of findDuplicateIds(apiProducts)) {
    discrepancies.push({
      id,
      field: 'id',
      apiValue: 'duplicado',
      uiValue: 'no aplica',
      probableCause: 'La API devolvió IDs repetidos en el catálogo.',
    });
  }

  for (const id of findDuplicateIds(uiProducts)) {
    discrepancies.push({
      id,
      field: 'id',
      apiValue: apiById.has(id) ? id : 'ausente',
      uiValue: 'duplicado',
      probableCause: 'La interfaz repitió una tarjeta; puede deberse a renderizado duplicado.',
    });
  }

  for (const apiProduct of apiProducts) {
    const uiProduct = uiById.get(apiProduct.id);

    if (!uiProduct) {
      discrepancies.push({
        id: apiProduct.id,
        field: 'producto',
        apiValue: apiProduct.name,
        uiValue: 'ausente',
        probableCause: 'La interfaz puede tener paginación, filtros o un renderizado incompleto.',
      });
      continue;
    }

    if (!normalizeText(uiProduct.name).includes(normalizeText(apiProduct.name))) {
      discrepancies.push({
        id: apiProduct.id,
        field: 'nombre',
        apiValue: apiProduct.name,
        uiValue: uiProduct.name,
        probableCause: 'El contenido visible puede estar desactualizado o diferir del catálogo de API.',
      });
    }

    if (normalizeText(uiProduct.price) !== normalizeText(apiProduct.price)) {
      discrepancies.push({
        id: apiProduct.id,
        field: 'precio',
        apiValue: apiProduct.price,
        uiValue: uiProduct.price,
        probableCause: 'El precio presentado no coincide con el valor devuelto por la API.',
      });
    }
  }

  for (const uiProduct of uiProducts) {
    if (!apiById.has(uiProduct.id)) {
      discrepancies.push({
        id: uiProduct.id,
        field: 'producto',
        apiValue: 'ausente',
        uiValue: uiProduct.name,
        probableCause: 'La interfaz puede estar mostrando contenido cacheado o no sincronizado con la API.',
      });
    }
  }

  if (discrepancies.length > 0) {
    console.error('Discrepancias UI/API:', JSON.stringify(discrepancies, null, 2));
  } else {
    console.log(`Catálogo consistente: ${apiProducts.length} productos; nombres y precios coinciden.`);
  }

  expect(
    discrepancies,
    `Se encontraron discrepancias entre la API y la interfaz:\n${JSON.stringify(discrepancies, null, 2)}`,
  ).toEqual([]);
});