import { test, expect } from '../fixtures';
import { USERS, PASSWORD } from '../data/users';
import { toCents } from '../data/money';
import type { SortOption } from '../pages/InventoryPage';

const byName = (a: string, b: string) => a.localeCompare(b);

test.describe('Product sorting', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.login(USERS.standard, PASSWORD);
    });

    test('defaults to Name (A to Z)', async ({ inventoryPage }) => {
        await expect(inventoryPage.sortSelect).toHaveValue('az');
        const names = await inventoryPage.itemNames.allTextContents();
        expect(names).toEqual([...names].sort(byName));
    });

    // Each case derives the expected order from what is on screen, so the test
    // proves the list is sorted rather than matching a hard-coded snapshot.
    const cases: { option: SortOption; check: (names: string[], cents: number[]) => void }[] = [
        { option: 'Name (A to Z)', check: (names) => expect(names).toEqual([...names].sort(byName)) },
        { option: 'Name (Z to A)', check: (names) => expect(names).toEqual([...names].sort(byName).reverse()) },
        { option: 'Price (low to high)', check: (_, cents) => expect(cents).toEqual([...cents].sort((a, b) => a - b)) },
        { option: 'Price (high to low)', check: (_, cents) => expect(cents).toEqual([...cents].sort((a, b) => b - a)) },
    ];

    for (const { option, check } of cases) {
        test(`sorts by ${option}`, async ({ inventoryPage }) => {
            const before = await inventoryPage.itemNames.allTextContents();
            await inventoryPage.sortBy(option);

            const names = await inventoryPage.itemNames.allTextContents();
            const cents = (await inventoryPage.itemPrices.allTextContents()).map(toCents);
            check(names, cents);
            // Sorting reorders the catalogue; it must never add or drop products.
            expect([...names].sort(byName)).toEqual([...before].sort(byName));
        });
    }
});
