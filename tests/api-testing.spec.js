// @ts-check
import { test, expect } from '@playwright/test';
import { generateEmail, TEST_PASSWORD } from '../fixtures/testData.js';

const apiUrl = 'https://www.automationexercise.com/api';

const createApiUser = async (request) => {
  const user = {
    name: `API User ${Date.now()}`,
    email: generateEmail('api-user'),
    password: TEST_PASSWORD,
    title: 'Mr',
    birth_date: '10',
    birth_month: '5',
    birth_year: '1995',
    firstname: 'API',
    lastname: 'Automation',
    company: 'Test Company',
    address1: '123 Test Street',
    address2: 'Suite 1',
    country: 'India',
    zipcode: '110001',
    state: 'Delhi',
    city: 'New Delhi',
    mobile_number: '9876543210',
  };
  const response = await request.post(`${apiUrl}/createAccount`, { form: user });

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body.responseCode).toBe(201);
  expect(body.message).toMatch(/User created!/i);

  return user;
};

const deleteApiUser = async (request, user) => {
  const response = await request.delete(`${apiUrl}/deleteAccount`, {
    form: { email: user.email, password: user.password },
  });

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body.responseCode).toBe(200);
  expect(body.message).toMatch(/Account deleted!/i);
};

test.describe('API Testing - Products', () => {
  test('API 1: GET obtener toda la lista de productos', async ({ request }) => {
    const response = await request.get(`${apiUrl}/productsList`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.responseCode).toBe(200);
    expect(body.products).toBeInstanceOf(Array);
    expect(body.products.length).toBeGreaterThan(0);

    console.log('Productos:', JSON.stringify(body.products, null, 2));
  });

  test('GET negativo: endpoint inexistente devuelve error', async ({ request }) => {
    const response = await request.get(`${apiUrl}/endpointInexistente`);

    expect(response.status()).toBe(404);
  });

  test('API 2: POST productsList rechaza el método no soportado', async ({ request }) => {
    const response = await request.post(`${apiUrl}/productsList`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.responseCode).toBe(405);
    expect(body.message).toMatch(/method is not supported/i);
  });

  test('API 5: POST buscar productos con parámetro válido', async ({ request }) => {
    const response = await request.post(`${apiUrl}/searchProduct`, {
      form: { search_product: 'top' },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.responseCode).toBe(200);
    expect(body.products).toBeInstanceOf(Array);
    expect(body.products.length).toBeGreaterThan(0);

    console.log('Resultados de búsqueda:', JSON.stringify(body.products, null, 2));
  });

  test('API 6: POST buscar productos sin search_product devuelve error', async ({ request }) => {
    const response = await request.post(`${apiUrl}/searchProduct`, {
      form: {},
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.responseCode).toBe(400);
    expect(body.message).toMatch(/parameter is missing/i);
  });

  test('API 7: POST verificar login con datos válidos', async ({ request }) => {
    const user = await createApiUser(request);

    try {
      const response = await request.post(`${apiUrl}/verifyLogin`, {
        form: { email: user.email, password: user.password },
      });

      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.responseCode).toBe(200);
      expect(body.message).toMatch(/User exists!/i);
    } finally {
      await deleteApiUser(request, user);
    }
  });

  test('API 8: POST verificar login sin email devuelve error', async ({ request }) => {
    const response = await request.post(`${apiUrl}/verifyLogin`, {
      form: { password: TEST_PASSWORD },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.responseCode).toBe(400);
    expect(body.message).toMatch(/email or password parameter is missing/i);
  });

  test('API 9: DELETE verificar login rechaza el método', async ({ request }) => {
    const response = await request.delete(`${apiUrl}/verifyLogin`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.responseCode).toBe(405);
    expect(body.message).toMatch(/method is not supported/i);
  });

  test('API 10: POST verificar login con datos inválidos', async ({ request }) => {
    const response = await request.post(`${apiUrl}/verifyLogin`, {
      form: {
        email: generateEmail('api-no-registrado'),
        password: 'InvalidPassword123',
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.responseCode).toBe(404);
    expect(body.message).toMatch(/User not found!/i);
  });

  test('API 11: POST crear cuenta de usuario', async ({ request }) => {
    const user = {
      name: `API User ${Date.now()}`,
      email: generateEmail('api-create'),
      password: TEST_PASSWORD,
      title: 'Mr',
      birth_date: '10',
      birth_month: '5',
      birth_year: '1995',
      firstname: 'API',
      lastname: 'Automation',
      company: 'Test Company',
      address1: '123 Test Street',
      address2: 'Suite 1',
      country: 'India',
      zipcode: '110001',
      state: 'Delhi',
      city: 'New Delhi',
      mobile_number: '9876543210',
    };
    let accountCreated = false;

    try {
      const response = await request.post(`${apiUrl}/createAccount`, { form: user });
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.responseCode).toBe(201);
      expect(body.message).toMatch(/User created!/i);
      accountCreated = true;
    } finally {
      if (accountCreated) {
        await deleteApiUser(request, user);
      }
    }
  });

  test('API 12: DELETE eliminar cuenta de usuario', async ({ request }) => {
    const user = await createApiUser(request);

    await deleteApiUser(request, user);

    const verifyResponse = await request.post(`${apiUrl}/verifyLogin`, {
      form: { email: user.email, password: user.password },
    });
    const verifyBody = await verifyResponse.json();
    expect(verifyBody.responseCode).toBe(404);
  });

  test('API 13: PUT actualizar cuenta de usuario', async ({ request }) => {
    const user = await createApiUser(request);
    const updatedUser = {
      ...user,
      name: `${user.name} Updated`,
      firstname: 'Updated API',
    };

    try {
      const response = await request.put(`${apiUrl}/updateAccount`, {
        form: updatedUser,
      });
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.responseCode).toBe(200);
      expect(body.message).toMatch(/User updated!/i);
    } finally {
      await deleteApiUser(request, updatedUser);
    }
  });

  test('API 14: GET detalle de cuenta por email', async ({ request }) => {
    const user = await createApiUser(request);

    try {
      const response = await request.get(`${apiUrl}/getUserDetailByEmail`, {
        params: { email: user.email },
      });
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.responseCode).toBe(200);
      expect(body.user.email).toBe(user.email);
      expect(body.user.name).toBe(user.name);
    } finally {
      await deleteApiUser(request, user);
    }
  });
});