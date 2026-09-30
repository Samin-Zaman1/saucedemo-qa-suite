import { test, expect } from '../fixtures';

test.describe('Cart', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.login('standard_user', 'secret_sauce');
    });

    test('add item to cart', async ({ inventoryPage }) => {
        await inventoryPage.addBackpackToCart();
        await expect(inventoryPage.shoppingCartBadge).toHaveText('1');
    });

    test('removing an item clears the cart badge', async ({ inventoryPage }) => {
        await inventoryPage.addBackpackToCart();
        await inventoryPage.removeBackpackFromCart();
        await expect(inventoryPage.shoppingCartBadge).toHaveCount(0);
    });
});
