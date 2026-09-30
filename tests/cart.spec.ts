import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

test.describe('Cart', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  
      test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();

        inventoryPage = new InventoryPage(page);
        await loginPage.login('standard_user', 'secret_sauce');
    });
    test('add item to cart', async () => {
        await inventoryPage.addBackpackToCart();
        await expect(inventoryPage.shoppingCartBadge).toHaveText('1');
    });
});