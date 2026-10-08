export class HomePage {
  constructor(page) {
    this.page = page;
  }

  async visit() {
    await this.page.goto('https://www.automationexercise.com/');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async goToLogin() {
    await this.page.getByRole('link', { name: 'Signup / Login' }).click();
    await this.page.waitForURL('**/login');
  }
}
