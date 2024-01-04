import { UserInputModel } from '../../../../../../src/features/users/api/models/input/user-input-model';

export const expectPaginatedUsers = (
  response: any,
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  createUserInput: UserInputModel,
  createUserInput2: UserInputModel,
  createUserInput3: UserInputModel,
  createUserInput4: UserInputModel,
  createUserInput5: UserInputModel,
  createUserInput6: UserInputModel,
  createUserInput7: UserInputModel,
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
  const secondUser = response.body.items[1];
  const thirdUser = response.body.items[2];
  const fourth = response.body.items[3];
  const fifth = response.body.items[4];
  const sixth = response.body.items[5];
  const seventh = response.body.items[6];

  expect(firstUser).toHaveProperty('id');
  expect(firstUser).toHaveProperty('login');
  expect(firstUser).toHaveProperty('email');
  expect(firstUser).toHaveProperty('createdAt');

  expect(firstUser.id).toBeDefined();
  expect(firstUser.login).toBe(createUserInput.login);
  expect(firstUser.email).toBe(createUserInput.email);
  expect(firstUser.createdAt).toBeDefined();

  expect(secondUser.id).toBeDefined();
  expect(secondUser.login).toBe(createUserInput2.login);
  expect(secondUser.email).toBe(createUserInput2.email);
  expect(secondUser.createdAt).toBeDefined();

  expect(thirdUser.id).toBeDefined();
  expect(thirdUser.login).toBe(createUserInput3.login);
  expect(thirdUser.email).toBe(createUserInput3.email);
  expect(thirdUser.createdAt).toBeDefined();

  expect(fourth.id).toBeDefined();
  expect(fourth.login).toBe(createUserInput4.login);
  expect(fourth.email).toBe(createUserInput4.email);
  expect(fourth.createdAt).toBeDefined();

  expect(fifth.id).toBeDefined();
  expect(fifth.login).toBe(createUserInput5.login);
  expect(fifth.email).toBe(createUserInput5.email);
  expect(fifth.createdAt).toBeDefined();

  expect(sixth.id).toBeDefined();
  expect(sixth.login).toBe(createUserInput6.login);
  expect(sixth.email).toBe(createUserInput6.email);
  expect(sixth.createdAt).toBeDefined();

  expect(seventh.id).toBeDefined();
  expect(seventh.login).toBe(createUserInput7.login);
  expect(seventh.email).toBe(createUserInput7.email);
  expect(seventh.createdAt).toBeDefined();
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
//     "createdAt": "2023-12-30T14:25:14.900Z"
//   }
// ]
// }
