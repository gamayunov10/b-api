import { BlogInputModel } from '../../../../../../src/features/blogs/api/models/input/blog-input-model';

export const expectFirstPaginatedBlog = (
  response: any,
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  createBlogInput: BlogInputModel,
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
  expect(firstUser).toHaveProperty('name');
  expect(firstUser).toHaveProperty('description');
  expect(firstUser).toHaveProperty('websiteUrl');
  expect(firstUser).toHaveProperty('createdAt');
  expect(firstUser).toHaveProperty('isMembership');

  expect(firstUser.id).toBeDefined();
  expect(firstUser.name).toBe(createBlogInput.name);
  expect(firstUser.description).toBe(createBlogInput.description);
  expect(firstUser.websiteUrl).toBe(createBlogInput.websiteUrl);
  expect(firstUser.createdAt).toBeDefined();
  expect(firstUser.isMembership).toBeTruthy();
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
//     "name": "string",
//     "description": "string",
//     "websiteUrl": "string",
//     "createdAt": "2024-01-04T06:41:46.133Z",
//     "isMembership": true
//   }
// ]
// }
