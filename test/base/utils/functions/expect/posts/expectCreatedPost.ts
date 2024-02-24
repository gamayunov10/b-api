import { PostInputModel } from '../../../../../../src/features/posts/api/models/input/post-input-model';

export const expectCreatedPost = (
  response,
  createPostInput: PostInputModel,
  blogId: string,
  blogName: string,
) => {
  expect(response.body).toHaveProperty('id');
  expect(response.body).toHaveProperty('title');
  expect(response.body).toHaveProperty('shortDescription');
  expect(response.body).toHaveProperty('content');
  expect(response.body).toHaveProperty('blogId');
  expect(response.body).toHaveProperty('blogName');
  expect(response.body).toHaveProperty('createdAt');
  expect(response.body).toHaveProperty('extendedLikesInfo');
  expect(response.body.extendedLikesInfo).toBeInstanceOf(Object);
  expect(response.body.extendedLikesInfo).toHaveProperty('likesCount');
  expect(response.body.extendedLikesInfo).toHaveProperty('dislikesCount');
  expect(response.body.extendedLikesInfo).toHaveProperty('myStatus');
  expect(response.body.extendedLikesInfo).toHaveProperty('newestLikes');
  expect(response.body.extendedLikesInfo.newestLikes).toBeInstanceOf(Array);

  expect(response.body.id).toBeDefined();
  expect(response.body.title).toBe(createPostInput.title);
  expect(response.body.shortDescription).toBe(createPostInput.shortDescription);
  expect(response.body.content).toBe(createPostInput.content);
  expect(response.body.blogId).toBe(blogId);
  expect(response.body.blogName).toBe(blogName);
  expect(response.body.createdAt).toBeDefined();
};

// Example

// {
//   "id": "string",
//   "title": "string",
//   "shortDescription": "string",
//   "content": "string",
//   "blogId": "string",
//   "blogName": "string",
//   "createdAt": "2024-01-04T06:41:46.304Z",
//   "extendedLikesInfo": {
//     "likesCount": 0,
//     "dislikesCount": 0,
//     "myStatus": "None",
//     "newestLikes": [
//     {
//       "addedAt": "2024-01-04T06:41:46.304Z",
//       "userId": "string",
//       "login": "string"
//     }
//   ]
// }
// }
