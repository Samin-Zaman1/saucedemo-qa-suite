import { type APIRequestContext, type APIResponse } from '@playwright/test';

export type UserPayload = {
  name: string;
  job: string;
};

export class UsersApi {
  private readonly baseUrl = process.env.API_BASE_URL ?? 'https://reqres.in/api';
  private readonly headers: { 'x-api-key': string };

  constructor(private readonly request: APIRequestContext) {
    const key = process.env.REQRES_API_KEY;
    if (!key) {
      throw new Error('REQRES_API_KEY is not set. Add it to .env locally or to GitHub Actions secrets.');
    }
    this.headers = { 'x-api-key': key };
  }

  async getUser(id: number): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/users/${id}`, { headers: this.headers });
  }

  async createUser(user: UserPayload): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/users`, { headers: this.headers, data: user });
  }

  async updateUser(id: number, user: UserPayload): Promise<APIResponse> {
    return this.request.put(`${this.baseUrl}/users/${id}`, { headers: this.headers, data: user });
  }
}