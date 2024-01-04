import { UserInputModel } from '../../../../../../src/features/users/api/models/input/user-input-model';

export const expectCreatedUser = (
  response,
  createUserInput: UserInputModel,
) => {
  expect(response.body).toHaveProperty('id');
  expect(response.body).toHaveProperty('login');
  expect(response.body).toHaveProperty('email');
  expect(response.body).toHaveProperty('createdAt');

  expect(response.body.id).toBeDefined();
  expect(response.body.login).toBe(createUserInput.login);
  expect(response.body.email).toBe(createUserInput.email);
  expect(response.body.createdAt).toBeDefined();
};

// Example

// {
//   "id": "874",
//   "login": "login1",
//   "email": "11911@gmail.com",
//   "createdAt": "2023-12-30T11:12:25.306Z"
// }
