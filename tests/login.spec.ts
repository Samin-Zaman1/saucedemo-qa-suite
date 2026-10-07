import { test, expect } from '../fixtures';
import { USERS, PASSWORD } from '../data/users';

test.describe('Login', () => {
    test('valid user reaches the products page', async ({ page, loginPage }) => {
        await loginPage.login(USERS.standard, PASSWORD);
        await expect(page).toHaveURL(/inventory/);
    });

    test('locked out user sees an error message', async ({ loginPage }) => {
        await loginPage.login(USERS.lockedOut, PASSWORD);
        await expect(loginPage.error).toContainText('locked out');
    });

    test('blank credentials are rejected', async ({ loginPage }) => {
        await loginPage.login('', '');
        await expect(loginPage.error).toContainText('Username is required');
    });

    test('invalid password is rejected', async ({ loginPage }) => {
        await loginPage.login(USERS.standard, 'wrong_password');
        await expect(loginPage.error).toContainText('do not match any user');
    });

    test('whitespace-only username is rejected', async ({ loginPage }) => {
        await loginPage.login('   ', PASSWORD);
        await expect(loginPage.error).toContainText('do not match any user');
    });
});
