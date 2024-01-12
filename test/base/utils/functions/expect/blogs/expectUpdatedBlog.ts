import { BlogInputModel } from '../../../../../../src/features/blogs/api/models/input/blog-input-model';

export const expectUpdatedBlog = (
  response,
  createBlogInput: BlogInputModel,
) => {
  expect(response).toHaveProperty('id');
  expect(response).toHaveProperty('name');
  expect(response).toHaveProperty('description');
  expect(response).toHaveProperty('websiteUrl');
  expect(response).toHaveProperty('createdAt');
  expect(response).toHaveProperty('isMembership');

  expect(response.id).toBeDefined();
  expect(response.name).toBe(createBlogInput.name);
  expect(response.description).toBe(createBlogInput.description);
  expect(response.websiteUrl).toBe(createBlogInput.websiteUrl);
  expect(response.createdAt).toBeDefined();
  expect(response.isMembership).toBeFalsy();
};

// Example

// {
//   "id": "string",
//   "name": "string",
//   "description": "string",
//   "websiteUrl": "string",
//   "createdAt": "2024-01-03T13:27:41.109Z",
//   "isMembership": true
// }
