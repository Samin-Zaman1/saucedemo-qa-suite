import { test, expect } from '../fixtures';
import { USERS, PASSWORD } from '../data/users';
import { toCents } from '../data/money';
import type { CustomerInfo } from '../pages/CheckoutPage';

/*
 * Defects found in SauceDemo, kept as expected-failure tests.
 *
 * Each test asserts the CORRECT behaviour and is marked with test.fail(), so:
 *   - while the bug exists, the test fails as expected and the run stays green;
 *   - if the bug is ever fixed, the test passes, Playwright reports it as an
 *     unexpected pass, and the run goes red so the test can be promoted.
 * The "known bug" annotation shows up next to each test in the HTML report.
 */

const ALL_PRODUCTS = [
    'Sauce Labs Backpack',
    'Sauce Labs Bike Light',
    'Sauce Labs Bolt T-Shirt',
    'Sauce Labs Fleece Jacket',
    'Sauce Labs Onesie',
    'Test.allTheThings() T-Shirt (Red)',
];

const customer: CustomerInfo = { firstName: 'Ada', lastName: 'Lovelace', postalCode: '1207' };
const bug = (description: string) => ({ annotation: { type: 'known bug', description } });

test.describe('standard_user', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.login(USERS.standard, PASSWORD);
    });

    test.fail(
        'checkout item total is shown to two decimal places',
        bug('With every product except the backpack in the cart, the overview shows "Item total: $99.94999999999999": a floating-point sum displayed without rounding.'),
        async ({ inventoryPage, cartPage, checkoutPage }) => {
            for (const name of ALL_PRODUCTS.filter((n) => n !== 'Sauce Labs Backpack')) {
                await inventoryPage.addToCart(name);
            }
            await inventoryPage.openCart();
            await cartPage.checkout();
            await checkoutPage.submitInfo(customer);

            await expect(checkoutPage.subtotal).toHaveText(/^Item total: \$\d+\.\d{2}$/);
        },
    );
});

test.describe('problem_user', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.login(USERS.problem, PASSWORD);
    });

    test.fail(
        'every product shows its own image',
        bug('All six products show the same 404 placeholder image.'),
        async ({ inventoryPage }) => {
            const sources = await inventoryPage.itemImages.evaluateAll((imgs) => imgs.map((i) => i.getAttribute('src')));
            expect(new Set(sources).size).toBe(ALL_PRODUCTS.length);
        },
    );

    test.fail(
        'sorting reorders the product list',
        bug('Choosing any sort option leaves the list in its original order.'),
        async ({ inventoryPage }) => {
            await inventoryPage.sortBy('Name (Z to A)');
            await expect(inventoryPage.itemNames).toHaveText([...ALL_PRODUCTS].reverse());
        },
    );

    test.fail(
        'every product can be added to the cart',
        bug('Only some "Add to cart" buttons respond; the cart badge stops at 2 of 6.'),
        async ({ inventoryPage }) => {
            for (const name of ALL_PRODUCTS) {
                await inventoryPage.addToCart(name);
            }
            await expect(inventoryPage.shoppingCartBadge).toHaveText(String(ALL_PRODUCTS.length));
        },
    );

    test.fail(
        'removing a product from the products page empties the cart',
        bug('"Remove" on the products page has no effect; the item stays in the cart.'),
        async ({ inventoryPage }) => {
            await inventoryPage.addToCart('Sauce Labs Backpack');
            await inventoryPage.removeFromCart('Sauce Labs Backpack');
            await expect(inventoryPage.shoppingCartBadge).toHaveCount(0);
        },
    );

    test.fail(
        'last name field keeps what is typed into it',
        bug('Typing in Last Name overwrites First Name instead, so checkout can never pass validation.'),
        async ({ inventoryPage, cartPage, checkoutPage }) => {
            await inventoryPage.addToCart('Sauce Labs Backpack');
            await inventoryPage.openCart();
            await cartPage.checkout();
            await checkoutPage.fillInfo(customer);

            await expect(checkoutPage.firstName).toHaveValue(customer.firstName);
            await expect(checkoutPage.lastName).toHaveValue(customer.lastName);
        },
    );
});

test.describe('error_user', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.login(USERS.error, PASSWORD);
    });

    test.fail(
        'sorting reorders the product list',
        bug('Sorting shows a "Sorting is broken!" alert and leaves the list unsorted.'),
        async ({ inventoryPage }) => {
            await inventoryPage.sortBy('Name (Z to A)');
            await expect(inventoryPage.itemNames).toHaveText([...ALL_PRODUCTS].reverse());
        },
    );

    test.fail(
        'checkout requires a last name',
        bug('A blank last name passes validation and checkout moves on to the overview.'),
        async ({ page, inventoryPage, cartPage, checkoutPage }) => {
            await inventoryPage.addToCart('Sauce Labs Backpack');
            await inventoryPage.openCart();
            await cartPage.checkout();
            await checkoutPage.submitInfo({ ...customer, lastName: '' });

            await expect(checkoutPage.error).toHaveText('Error: Last Name is required');
            await expect(page).toHaveURL(/checkout-step-one/);
        },
    );

    test.fail(
        'Finish completes the order',
        bug('Clicking Finish on the overview does nothing; the order is never placed.'),
        async ({ page, inventoryPage, cartPage, checkoutPage }) => {
            await inventoryPage.addToCart('Sauce Labs Backpack');
            await inventoryPage.openCart();
            await cartPage.checkout();
            await checkoutPage.submitInfo(customer);
            await expect(page).toHaveURL(/checkout-step-two/);

            await checkoutPage.finish();
            await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
        },
    );
});

test.describe('visual_user', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.login(USERS.visual, PASSWORD);
    });

    test.fail(
        'product list price matches the price charged in the cart',
        bug('Prices on the products page are random and change on every sort; the cart charges the real price.'),
        async ({ page, inventoryPage, cartPage }) => {
            const listed = toCents(await inventoryPage.item('Sauce Labs Backpack').getByTestId('inventory-item-price').innerText());
            await inventoryPage.addToCart('Sauce Labs Backpack');
            await inventoryPage.openCart();
            await expect(page).toHaveURL(/cart/);
            await expect(cartPage.itemNames).toHaveText(['Sauce Labs Backpack']);

            const charged = toCents(await cartPage.itemPrices.innerText());
            expect(listed).toBe(charged);
        },
    );

    test.fail(
        'every product image loads',
        bug('The backpack shows the 404 placeholder image.'),
        async ({ inventoryPage }) => {
            const sources = await inventoryPage.itemImages.evaluateAll((imgs) => imgs.map((i) => i.getAttribute('src') ?? ''));
            expect(sources.filter((s) => s.includes('404'))).toEqual([]);
        },
    );
});

test.describe('performance_glitch_user', () => {
    // Not a known-bug test: this account is deliberately slow, and the point is
    // that the suite copes through Playwright's auto-waiting, without any sleeps.
    test('can still sort and complete a purchase', async ({ page, loginPage, inventoryPage, cartPage, checkoutPage }) => {
        test.slow();
        await loginPage.login(USERS.performanceGlitch, PASSWORD);

        await inventoryPage.sortBy('Price (low to high)');
        await expect(inventoryPage.itemNames.first()).toHaveText('Sauce Labs Onesie');

        await inventoryPage.addToCart('Sauce Labs Onesie');
        await inventoryPage.openCart();
        await cartPage.checkout();
        await checkoutPage.submitInfo(customer);
        await checkoutPage.finish();
        await expect(page).toHaveURL(/checkout-complete/);
    });
});
