import { PostInputModel } from '../../../../../../src/features/posts/api/models/input/post-input-model';

export const expectFirstPaginatedPost = (
  response: any,
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  createPostInput: PostInputModel,
  blogId: string,
  blogName: string,
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

  const firstPost = response.body.items[0];

  expect(firstPost).toHaveProperty('id');
  expect(firstPost).toHaveProperty('title');
  expect(firstPost).toHaveProperty('shortDescription');
  expect(firstPost).toHaveProperty('content');
  expect(firstPost).toHaveProperty('blogId');
  expect(firstPost).toHaveProperty('blogName');
  expect(firstPost).toHaveProperty('createdAt');
  expect(firstPost).toHaveProperty('extendedLikesInfo');

  expect(firstPost.id).toBeDefined();
  expect(firstPost.title).toBe(createPostInput.title);
  expect(firstPost.shortDescription).toBe(createPostInput.shortDescription);
  expect(firstPost.content).toBe(createPostInput.content);
  expect(firstPost.blogId).toBe(blogId);
  expect(firstPost.blogName).toBe(blogName);
  expect(firstPost.createdAt).toBeDefined();
  expect(firstPost.extendedLikesInfo).toBeInstanceOf(Object);
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
//     "title": "string",
//     "shortDescription": "string",
//     "content": "string",
//     "blogId": "string",
//     "blogName": "string",
//     "createdAt": "2024-01-04T06:41:46.321Z",
//     "extendedLikesInfo": {
//       "likesCount": 0,
//       "dislikesCount": 0,
//       "myStatus": "None",
//       "newestLikes": [
//         {
//           "addedAt": "2024-01-04T06:41:46.321Z",
//           "userId": "string",
//           "login": "string"
//         }
//       ]
//     }
//   }
// ]
// }
