import { test, expect } from '../fixtures';

test.describe('Login', () => {
    test('valid user reaches the products page', async ({ page, loginPage }) => {
        await loginPage.login('standard_user', 'secret_sauce');
        await expect(page).toHaveURL(/inventory/);
    });

    test('locked out user sees an error message', async ({ loginPage }) => {
        await loginPage.login('locked_out_user', 'secret_sauce');
        await expect(loginPage.error).toContainText('locked out');
    });

    test('blank credentials are rejected', async ({ loginPage }) => {
        await loginPage.login('', '');
        await expect(loginPage.error).toContainText('Username is required');
    });

    test('invalid password is rejected', async ({ loginPage }) => {
        await loginPage.login('standard_user', 'wrong_password');
        await expect(loginPage.error).toContainText('do not match any user');
    });

    test('whitespace-only username is rejected', async ({ loginPage }) => {
        await loginPage.login('   ', 'secret_sauce');
        await expect(loginPage.error).toContainText('do not match any user');
    });
});
