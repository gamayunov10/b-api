export const expectPaginatedUsers = (
  response: any,
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  login: string,
  email: string,
  login2: string,
  email2: string,
  login3: string,
  email3: string,
  login4: string,
  email4: string,
  login5: string,
  email5: string,
  login6: string,
  email6: string,
  login7: string,
  email7: string,
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
  expect(firstUser.login).toBe(login);
  expect(firstUser.email).toBe(email);
  expect(firstUser.createdAt).toBeDefined();

  expect(secondUser.id).toBeDefined();
  expect(secondUser.login).toBe(login2);
  expect(secondUser.email).toBe(email2);
  expect(secondUser.createdAt).toBeDefined();

  expect(thirdUser.id).toBeDefined();
  expect(thirdUser.login).toBe(login3);
  expect(thirdUser.email).toBe(email3);
  expect(thirdUser.createdAt).toBeDefined();

  expect(fourth.id).toBeDefined();
  expect(fourth.login).toBe(login4);
  expect(fourth.email).toBe(email4);
  expect(fourth.createdAt).toBeDefined();

  expect(fifth.id).toBeDefined();
  expect(fifth.login).toBe(login5);
  expect(fifth.email).toBe(email5);
  expect(fifth.createdAt).toBeDefined();

  expect(sixth.id).toBeDefined();
  expect(sixth.login).toBe(login6);
  expect(sixth.email).toBe(email6);
  expect(sixth.createdAt).toBeDefined();

  expect(seventh.id).toBeDefined();
  expect(seventh.login).toBe(login7);
  expect(seventh.email).toBe(email7);
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
