export const expectFirstPaginatedUser = (
  response: any,
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  login: string,
  email: string,
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

  expect(firstUser.id).toBeDefined();
  expect(firstUser.login).toBe(login);
  expect(firstUser.email).toBe(email);
  expect(firstUser.createdAt).toBeDefined();
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
