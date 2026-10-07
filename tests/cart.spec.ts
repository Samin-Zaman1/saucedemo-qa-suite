import { test, expect } from '../fixtures';
import { USERS, PASSWORD } from '../data/users';

test.describe('Cart', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.login(USERS.standard, PASSWORD);
    });

    test('add item to cart', async ({ inventoryPage }) => {
        await inventoryPage.addToCart('Sauce Labs Backpack');
        await expect(inventoryPage.shoppingCartBadge).toHaveText('1');
    });

    test('removing an item clears the cart badge', async ({ inventoryPage }) => {
        await inventoryPage.addToCart('Sauce Labs Backpack');
        await inventoryPage.removeFromCart('Sauce Labs Backpack');
        await expect(inventoryPage.shoppingCartBadge).toHaveCount(0);
    });

    test('cart lists exactly the items that were added', async ({ inventoryPage, cartPage }) => {
        await inventoryPage.addToCart('Sauce Labs Backpack');
        await inventoryPage.addToCart('Sauce Labs Onesie');
        await expect(inventoryPage.shoppingCartBadge).toHaveText('2');

        await inventoryPage.openCart();
        await expect(cartPage.itemNames).toHaveText(['Sauce Labs Backpack', 'Sauce Labs Onesie']);
    });

    test('removing an item on the cart page updates the list and badge', async ({ inventoryPage, cartPage }) => {
        await inventoryPage.addToCart('Sauce Labs Backpack');
        await inventoryPage.addToCart('Sauce Labs Bike Light');
        await inventoryPage.openCart();

        await cartPage.removeItem('Sauce Labs Backpack');
        await expect(cartPage.itemNames).toHaveText(['Sauce Labs Bike Light']);
        await expect(inventoryPage.shoppingCartBadge).toHaveText('1');
    });

    test('cart contents survive navigating back to the products page', async ({ page, inventoryPage, cartPage }) => {
        await inventoryPage.addToCart('Sauce Labs Fleece Jacket');
        await inventoryPage.openCart();
        await cartPage.continueShoppingButton.click();

        await expect(page).toHaveURL(/inventory/);
        await expect(inventoryPage.shoppingCartBadge).toHaveText('1');
        await expect(
            inventoryPage.item('Sauce Labs Fleece Jacket').getByRole('button', { name: 'Remove' }),
        ).toBeVisible();
    });
});
