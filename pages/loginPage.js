export class LoginPage {
  constructor(page) {
    this.page = page;
  }

  async signup(name, email) {
    await this.page.locator('input[data-qa="signup-name"]').fill(name);
    await this.page.locator('input[data-qa="signup-email"]').fill(email);
    await this.page.getByRole('button', { name: 'Signup' }).click();
    await this.page.getByRole('heading', { name: 'Enter Account Information' }).waitFor();
  }

  async fillRegistrationDetails({
    title = 'Mr.',
    password = 'Password123',
    firstName = 'Juan',
    lastName = 'Pérez',
    address = 'Calle Falsa 123',
    city = 'Madrid',
    state = 'Madrid',
    zipcode = '28001',
    country = 'India',
    mobileNumber = '612345678',
  }) {
    if (title === 'Mr.') {
      await this.page.locator('input[id="id_gender1"]').check();
    } else {
      await this.page.locator('input[id="id_gender2"]').check();
    }

    await this.page.locator('input[data-qa="password"]').fill(password);
    await this.page.locator('select[data-qa="days"]').selectOption('15');
    await this.page.locator('select[data-qa="months"]').selectOption('5');
    await this.page.locator('select[data-qa="years"]').selectOption('1995');

    await this.page.locator('input[data-qa="first_name"]').fill(firstName);
    await this.page.locator('input[data-qa="last_name"]').fill(lastName);
    await this.page.locator('input[data-qa="address"]').fill(address);
    await this.page.locator('input[data-qa="city"]').fill(city);
    await this.page.locator('input[data-qa="state"]').fill(state);
    await this.page.locator('input[data-qa="zipcode"]').fill(zipcode);
    await this.page.locator('select[data-qa="country"]').selectOption({ label: country });
    await this.page.locator('input[data-qa="mobile_number"]').fill(mobileNumber);
    await this.page.getByRole('button', { name: 'Create Account' }).click();
  }

  async register(name, email, details = {}) {
    await this.signup(name, email);
    await this.fillRegistrationDetails(details);
    await this.page.locator('h2[data-qa="account-created"]').waitFor();
  }

  async login(email, password) {
    await this.page.locator('input[data-qa="login-email"]').fill(email);
    await this.page.locator('input[data-qa="login-password"]').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }

  async clickContinue() {
    await this.page.getByRole('link', { name: 'Continue' }).click();
  }
}
