import { UserInputModel } from '../../../../../../src/features/users/api/models/input/user-input-model';

export const expectCreatedUser = (
  response,
  createUserInput: UserInputModel,
  isBanned: boolean,
  banReason: string | null,
) => {
  expect(response.body).toHaveProperty('id');
  expect(response.body).toHaveProperty('login');
  expect(response.body).toHaveProperty('email');
  expect(response.body).toHaveProperty('createdAt');
  expect(response.body).toHaveProperty('banInfo');

  expect(response.body.id).toBeDefined();
  expect(response.body.login).toBe(createUserInput.login);
  expect(response.body.email).toBe(createUserInput.email);
  expect(response.body.createdAt).toBeDefined();

  expect(response.body.banInfo).toBeInstanceOf(Object);
  expect(response.body.banInfo).toHaveProperty('isBanned');
  expect(response.body.banInfo).toHaveProperty('banDate');
  expect(response.body.banInfo).toHaveProperty('banReason');

  expect(response.body.banInfo.banDate).toBeDefined();
  expect(response.body.banInfo.banReason).toBeDefined();

  expect(response.body.banInfo.isBanned).toBe(isBanned);
  expect(response.body.banInfo.banReason).toBe(banReason);
};

// Example

// {
//   "id": "502",
//   "login": "login12",
//   "email": "2gamaunov1911@gmail.com",
//   "createdAt": "2024-02-20T06:37:36.735Z",
//   "banInfo": {
//   "isBanned": false,
//     "banDate": null,
//     "banReason": null
// }
// }
