import { type Locator, type Page } from '@playwright/test';

export class InventoryPage {
  readonly addBackpack: Locator;
  readonly removeFromCart: Locator;
  readonly shoppingCartBadge: Locator;

  constructor(private readonly page: Page) {
    this.addBackpack = page.getByTestId('add-to-cart-sauce-labs-backpack');
    this.removeFromCart = page.getByTestId('remove-sauce-labs-backpack');
    this.shoppingCartBadge = page.getByTestId('shopping-cart-badge');
  }

async addBackpackToCart(): Promise<void> {
  await this.addBackpack.click();
}
async removeBackpackFromCart(): Promise<void> {
  await this.removeFromCart.click();
}
}