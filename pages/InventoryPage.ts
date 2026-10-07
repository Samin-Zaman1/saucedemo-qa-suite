import { type Locator, type Page } from '@playwright/test';

export type SortOption =
  | 'Name (A to Z)'
  | 'Name (Z to A)'
  | 'Price (low to high)'
  | 'Price (high to low)';

export class InventoryPage {
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly itemImages: Locator;
  readonly sortSelect: Locator;
  readonly shoppingCartBadge: Locator;
  readonly shoppingCartLink: Locator;

  constructor(private readonly page: Page) {
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.itemImages = page.locator('.inventory_item_img img');
    this.sortSelect = page.getByRole('combobox', { name: 'Sort products' });
    this.shoppingCartBadge = page.getByTestId('shopping-cart-badge');
    this.shoppingCartLink = page.getByTestId('shopping-cart-link');
  }

  /** The product card for one item, so its buttons can be found by visible text. */
  item(name: string): Locator {
    return this.page.getByTestId('inventory-item').filter({ hasText: name });
  }

  async addToCart(name: string): Promise<void> {
    await this.item(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeFromCart(name: string): Promise<void> {
    await this.item(name).getByRole('button', { name: 'Remove' }).click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption({ label: option });
  }

  async openCart(): Promise<void> {
    await this.shoppingCartLink.click();
  }
}
