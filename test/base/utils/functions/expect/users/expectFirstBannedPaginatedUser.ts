import { UserInputModel } from '../../../../../../src/features/users/api/models/input/user-input-model';

export const expectFirstBannedPaginatedUser = (
  response: any,
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  createUserInput: UserInputModel,
  isBanned: boolean,
  banReason?: string,
) => {
  expect(response.body).toHaveProperty('pagesCount');
  expect(response.body).toHaveProperty('page');
  expect(response.body).toHaveProperty('pageSize');
  expect(response.body).toHaveProperty('totalCount');
  expect(response.body).toHaveProperty('items');

  expect(response.body.pagesCount).toBe(pagesCount);
  expect(response.body.page).toBe(page);
  expect(response.body.pageSize).toBe(pageSize);
  expect(response.body.totalCount).toBe(totalCount);
  expect(response.body.items).toBeInstanceOf(Array);

  const firstUser = response.body.items[0];

  expect(firstUser).toHaveProperty('id');
  expect(firstUser).toHaveProperty('login');
  expect(firstUser).toHaveProperty('email');
  expect(firstUser).toHaveProperty('createdAt');
  expect(firstUser).toHaveProperty('banInfo');

  expect(firstUser.id).toBeDefined();
  expect(firstUser.login).toBe(createUserInput.login);
  expect(firstUser.email).toBe(createUserInput.email);
  expect(firstUser.createdAt).toBeDefined();

  expect(firstUser.banInfo).toBeInstanceOf(Object);
  expect(firstUser.banInfo).toHaveProperty('isBanned');
  expect(firstUser.banInfo.isBanned).toBe(isBanned);
  expect(firstUser.banInfo).toHaveProperty('banDate');
  expect(firstUser.banInfo).toHaveProperty('banReason');

  if (banReason) {
    expect(firstUser.banInfo.banReason).toBe(banReason);
  }
};

// Example

// {
//   "pagesCount": 0,
//   "page": 0,
//   "pageSize": 0,
//   "totalCount": 0,
//   "items": [
//   {
//     "id": "string",
//     "login": "string",
//     "email": "string",
//     "createdAt": "2024-02-18T13:32:42.164Z",
//     "banInfo": {
//       "isBanned": true,
//       "banDate": "2024-02-18T13:32:42.164Z",
//       "banReason": "string"
//     }
//   }
// ]
// }
