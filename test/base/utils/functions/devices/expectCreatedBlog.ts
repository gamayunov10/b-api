export const expectCreatedBlog = (response, name, description, websiteUrl) => {
  expect(response.body).toHaveProperty('id');
  expect(response.body).toHaveProperty('name');
  expect(response.body).toHaveProperty('description');
  expect(response.body).toHaveProperty('websiteUrl');
  expect(response.body).toHaveProperty('createdAt');
  expect(response.body).toHaveProperty('isMembership');

  expect(response.body.id).toBeDefined();
  expect(response.body.name).toBe(name);
  expect(response.body.description).toBe(description);
  expect(response.body.websiteUrl).toBe(websiteUrl);
  expect(response.body.createdAt).toBeDefined();
  expect(response.body.isMembership).toBeTruthy();
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
