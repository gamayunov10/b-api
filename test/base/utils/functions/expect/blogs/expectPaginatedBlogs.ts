import { BlogInputModel } from '../../../../../../src/features/blogs/api/models/input/blog-input-model';

export const expectPaginatedBlogs = (
  response: any,
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  createBlogInput: BlogInputModel,
  createBlogInput2: BlogInputModel,
  createBlogInput3: BlogInputModel,
  createBlogInput4: BlogInputModel,
  createBlogInput5: BlogInputModel,
  createBlogInput6: BlogInputModel,
  createBlogInput7: BlogInputModel,
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

  const firstBlog = response.body.items[0];
  const secondBlog = response.body.items[1];
  const thirdBlog = response.body.items[2];
  const fourthBlog = response.body.items[3];
  const fifthBlog = response.body.items[4];
  const sixthBlog = response.body.items[5];
  const seventhBlog = response.body.items[6];

  expect(firstBlog).toHaveProperty('id');
  expect(firstBlog).toHaveProperty('name');
  expect(firstBlog).toHaveProperty('description');
  expect(firstBlog).toHaveProperty('websiteUrl');
  expect(firstBlog).toHaveProperty('createdAt');
  expect(firstBlog).toHaveProperty('isMembership');

  expect(firstBlog.id).toBeDefined();
  expect(firstBlog.name).toBe(createBlogInput.name);
  expect(firstBlog.description).toBe(createBlogInput.description);
  expect(firstBlog.websiteUrl).toBe(createBlogInput.websiteUrl);
  expect(firstBlog.createdAt).toBeDefined();
  expect(firstBlog.isMembership).toBeTruthy();

  expect(secondBlog.id).toBeDefined();
  expect(secondBlog.name).toBe(createBlogInput2.name);
  expect(secondBlog.description).toBe(createBlogInput2.description);
  expect(secondBlog.websiteUrl).toBe(createBlogInput2.websiteUrl);
  expect(secondBlog.createdAt).toBeDefined();
  expect(secondBlog.isMembership).toBeTruthy();

  expect(thirdBlog.id).toBeDefined();
  expect(thirdBlog.name).toBe(createBlogInput3.name);
  expect(thirdBlog.description).toBe(createBlogInput3.description);
  expect(thirdBlog.websiteUrl).toBe(createBlogInput3.websiteUrl);
  expect(thirdBlog.createdAt).toBeDefined();
  expect(thirdBlog.isMembership).toBeTruthy();

  expect(fourthBlog.id).toBeDefined();
  expect(fourthBlog.name).toBe(createBlogInput4.name);
  expect(fourthBlog.description).toBe(createBlogInput4.description);
  expect(fourthBlog.websiteUrl).toBe(createBlogInput4.websiteUrl);
  expect(fourthBlog.createdAt).toBeDefined();
  expect(fourthBlog.isMembership).toBeTruthy();

  expect(fifthBlog.id).toBeDefined();
  expect(fifthBlog.name).toBe(createBlogInput5.name);
  expect(fifthBlog.description).toBe(createBlogInput5.description);
  expect(fifthBlog.websiteUrl).toBe(createBlogInput5.websiteUrl);
  expect(fifthBlog.createdAt).toBeDefined();
  expect(fifthBlog.isMembership).toBeTruthy();

  expect(sixthBlog.id).toBeDefined();
  expect(sixthBlog.name).toBe(createBlogInput6.name);
  expect(sixthBlog.description).toBe(createBlogInput6.description);
  expect(sixthBlog.websiteUrl).toBe(createBlogInput6.websiteUrl);
  expect(sixthBlog.createdAt).toBeDefined();
  expect(sixthBlog.isMembership).toBeTruthy();

  expect(seventhBlog.id).toBeDefined();
  expect(seventhBlog.name).toBe(createBlogInput7.name);
  expect(seventhBlog.description).toBe(createBlogInput7.description);
  expect(seventhBlog.websiteUrl).toBe(createBlogInput7.websiteUrl);
  expect(seventhBlog.createdAt).toBeDefined();
  expect(seventhBlog.isMembership).toBeTruthy();
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
