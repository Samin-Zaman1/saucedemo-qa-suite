import { test, expect } from '../fixtures';
import { USERS, PASSWORD } from '../data/users';
import { toCents, formatCents, TAX_RATE } from '../data/money';
import type { CustomerInfo } from '../pages/CheckoutPage';

const customer: CustomerInfo = { firstName: 'Ada', lastName: 'Lovelace', postalCode: '1207' };

test.describe('Checkout', () => {
    test.beforeEach(async ({ loginPage, inventoryPage }) => {
        await loginPage.login(USERS.standard, PASSWORD);
        await inventoryPage.addToCart('Sauce Labs Backpack');
        await inventoryPage.addToCart('Sauce Labs Bike Light');
        await inventoryPage.openCart();
    });

    test('completes an order and empties the cart', async ({ page, cartPage, checkoutPage, inventoryPage }) => {
        await cartPage.checkout();
        await checkoutPage.submitInfo(customer);
        await expect(checkoutPage.itemNames).toHaveText(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);

        await checkoutPage.finish();
        await expect(page).toHaveURL(/checkout-complete/);
        await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
        await expect(inventoryPage.shoppingCartBadge).toHaveCount(0);

        await checkoutPage.backHomeButton.click();
        await expect(page).toHaveURL(/inventory/);
    });

    test('overview totals add up: item total, 8% tax and grand total', async ({ cartPage, checkoutPage }) => {
        await cartPage.checkout();
        await checkoutPage.submitInfo(customer);

        // Work from the prices shown on the page rather than hard-coding them,
        // so the test checks the arithmetic, not a snapshot of today's catalogue.
        const prices = (await checkoutPage.itemPrices.allTextContents()).map(toCents);
        const subtotal = prices.reduce((sum, p) => sum + p, 0);
        const tax = Math.round(subtotal * TAX_RATE);

        await expect(checkoutPage.subtotal).toHaveText(`Item total: ${formatCents(subtotal)}`);
        await expect(checkoutPage.tax).toHaveText(`Tax: ${formatCents(tax)}`);
        await expect(checkoutPage.total).toHaveText(`Total: ${formatCents(subtotal + tax)}`);
    });

    const missingField: { field: keyof CustomerInfo; message: string }[] = [
        { field: 'firstName', message: 'Error: First Name is required' },
        { field: 'lastName', message: 'Error: Last Name is required' },
        { field: 'postalCode', message: 'Error: Postal Code is required' },
    ];

    for (const { field, message } of missingField) {
        test(`blocks checkout when ${field} is missing`, async ({ page, cartPage, checkoutPage }) => {
            await cartPage.checkout();
            await checkoutPage.submitInfo({ ...customer, [field]: '' });

            await expect(checkoutPage.error).toHaveText(message);
            await expect(page).toHaveURL(/checkout-step-one/);
        });
    }

    test('cancelling on the information step returns to the cart with items intact', async ({ page, cartPage, checkoutPage }) => {
        await cartPage.checkout();
        await checkoutPage.cancelButton.click();

        await expect(page).toHaveURL(/cart/);
        await expect(cartPage.itemNames).toHaveText(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
    });

    test('cancelling on the overview keeps the cart and places no order', async ({ page, cartPage, checkoutPage, inventoryPage }) => {
        await cartPage.checkout();
        await checkoutPage.submitInfo(customer);
        await checkoutPage.cancelButton.click();

        await expect(page).toHaveURL(/inventory/);
        await expect(inventoryPage.shoppingCartBadge).toHaveText('2');
    });
});
