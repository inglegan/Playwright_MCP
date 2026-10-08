export class CartPage {
  constructor(page) {
    this.page = page;
  }

  async open() {
    await this.page.goto('https://www.automationexercise.com/view_cart', {
      waitUntil: 'domcontentloaded',
    });
  }

  async proceedToCheckout() {
    const checkoutControl = this.page.getByText('Proceed To Checkout', { exact: true });
    await checkoutControl.waitFor({ state: 'visible' });
    await checkoutControl.click();
    await this.page.waitForURL('**/checkout', { waitUntil: 'domcontentloaded' });
    await this.page.getByRole('heading', { name: 'Address Details' })
      .waitFor({ state: 'visible' });
  }
}
