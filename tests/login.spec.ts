import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();
    });

    test('valid user reaches the products page', async ({ page }) => {
        await loginPage.login('standard_user', 'secret_sauce');
        await expect(page).toHaveURL(/inventory/);
    });

    test('locked out user sees an error message', async () => {
        await loginPage.login('locked_out_user', 'secret_sauce');
        await expect(loginPage.error).toContainText('locked out');
    });

    test('blank credentials are rejected', async () => {
        await loginPage.login('', '');
        await expect(loginPage.error).toContainText('Username is required');
    });
});