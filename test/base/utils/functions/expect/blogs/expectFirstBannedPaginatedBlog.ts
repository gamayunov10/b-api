import { BlogInputModel } from '../../../../../../src/features/blogs/api/models/input/blog-input-model';

export const expectFirstBannedPaginatedBlog = (
  response: any,
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  createBlogInput?: BlogInputModel,
  isBanned?: boolean,
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

  if (createBlogInput && isBanned && banReason) {
    expect(firstUser).toHaveProperty('id');
    expect(firstUser).toHaveProperty('login');
    expect(firstUser).toHaveProperty('banInfo');

    expect(firstUser.banInfo).toBeInstanceOf(Object);

    expect(firstUser.banInfo).toHaveProperty('isBanned');
    expect(firstUser.banInfo).toHaveProperty('banDate');
    expect(firstUser.banInfo).toHaveProperty('banReason');

    expect(firstUser.banInfo.isBanned).toBe(isBanned);
    expect(firstUser.banInfo.banDate).toBeDefined();
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
//     "banInfo": {
//       "isBanned": true,
//       "banDate": "2024-02-24T08:13:48.642Z",
//       "banReason": "string"
//     }
//   }
// ]
// }
