import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { UsersApi } from '../pages/UsersApi';

type Fixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  usersApi: UsersApi;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  usersApi: async ({ request }, use, testInfo) => {
    // Secrets aren't available to fork PRs, so skip API tests instead of failing the run.
    testInfo.skip(!process.env.REQRES_API_KEY, 'REQRES_API_KEY is not set');
    await use(new UsersApi(request));
  },
});

export { expect };
