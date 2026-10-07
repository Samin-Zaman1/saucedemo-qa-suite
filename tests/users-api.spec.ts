import { test, expect } from '../fixtures';

// Traces record request headers, including the x-api-key. The HTML report is
// published publicly, so never record traces for these tests.
test.use({ trace: 'off' });

test.describe('Users API', () => {
    test('get a single user', async ({ usersApi }) => {
        const response = await usersApi.getUser(2);
        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body.data.id).toBe(2);
    });

    test('get a non-existent user returns 404', async ({ usersApi }) => {
        const response = await usersApi.getUser(999);
        expect(response.status()).toBe(404);

        const body = await response.json();
        expect(body).toEqual({});
    });

    test('create a user', async ({ usersApi }) => {
        const response = await usersApi.createUser({ name: 'morpheus', job: 'leader' });
        expect(response.status()).toBe(201);

        const body = await response.json();
        expect(body.name).toBe('morpheus');
        expect(body.job).toBe('leader');
    });

    test('update a user', async ({ usersApi }) => {
        const response = await usersApi.updateUser(2, { name: 'morpheus', job: 'zion resident' });
        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body.name).toBe('morpheus');
        expect(body.job).toBe('zion resident');
    });
});