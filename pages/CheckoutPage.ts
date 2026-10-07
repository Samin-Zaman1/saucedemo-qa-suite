import { type Locator, type Page } from '@playwright/test';

export type CustomerInfo = {
  firstName: string;
  lastName: string;
  postalCode: string;
};

/** Covers all three checkout steps: your information, overview and complete. */
export class CheckoutPage {
  // Step one: your information
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly error: Locator;

  // Step two: overview
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;

  // Complete
  readonly completeHeader: Locator;
  readonly backHomeButton: Locator;

  constructor(private readonly page: Page) {
    this.firstName = page.getByPlaceholder('First Name');
    this.lastName = page.getByPlaceholder('Last Name');
    this.postalCode = page.getByPlaceholder('Zip/Postal Code');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.error = page.getByTestId('error');

    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByRole('button', { name: 'Finish' });

    this.completeHeader = page.getByTestId('complete-header');
    this.backHomeButton = page.getByRole('button', { name: 'Back Home' });
  }

  async fillInfo(info: CustomerInfo): Promise<void> {
    await this.firstName.fill(info.firstName);
    await this.lastName.fill(info.lastName);
    await this.postalCode.fill(info.postalCode);
  }

  async submitInfo(info: CustomerInfo): Promise<void> {
    await this.fillInfo(info);
    await this.continueButton.click();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
