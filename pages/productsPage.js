export class ProductsPage {
  constructor(page) {
    this.page = page;
  }

  async openCategory(categoryUrl) {
    await this.page.goto(categoryUrl, { waitUntil: 'domcontentloaded' });
    await this.page.locator('.product-image-wrapper').first().waitFor({ state: 'visible' });
  }

  async addProductsFromCategory(categoryUrl, quantity = 1, useRandom = false) {
    await this.page.goto(categoryUrl, { waitUntil: 'domcontentloaded' });
    const wrappers = this.page.locator('.product-image-wrapper');
    await wrappers.first().waitFor({ state: 'visible' });
    const total = await wrappers.count();
    const selected = new Set();

    while (selected.size < Math.min(quantity, total)) {
      selected.add(useRandom ? Math.floor(Math.random() * total) : selected.size);
    }

    for (const index of selected) {
      await wrappers.nth(index).locator('a.add-to-cart').first()
        .evaluate((productLink) => productLink.click());
      const cartModal = this.page.locator('#cartModal');
      await cartModal.getByText('Your product has been added to cart.', { exact: true })
        .waitFor({ state: 'visible' });
      await cartModal.getByRole('button', { name: 'Continue Shopping' }).click();
      await cartModal.waitFor({ state: 'hidden' });
    }
  }
}
