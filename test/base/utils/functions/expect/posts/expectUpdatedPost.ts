import { PostInputModel } from '../../../../../../src/features/posts/api/models/input/post-input-model';

export const expectUpdatedPost = (
  response,
  updatedPostInput: PostInputModel,
  blogId: string,
  blogName: string,
) => {
  expect(response).toHaveProperty('id');
  expect(response).toHaveProperty('title');
  expect(response).toHaveProperty('shortDescription');
  expect(response).toHaveProperty('content');
  expect(response).toHaveProperty('blogId');
  expect(response).toHaveProperty('blogName');
  expect(response).toHaveProperty('createdAt');
  expect(response).toHaveProperty('extendedLikesInfo');
  expect(response.extendedLikesInfo).toHaveProperty('likesCount');
  expect(response.extendedLikesInfo).toHaveProperty('dislikesCount');
  expect(response.extendedLikesInfo).toHaveProperty('myStatus');
  expect(response.extendedLikesInfo).toHaveProperty('newestLikes');
  expect(response.extendedLikesInfo.newestLikes).toBeInstanceOf(Array);

  expect(response.id).toBeDefined();
  expect(response.title).toBe(updatedPostInput.title);
  expect(response.shortDescription).toBe(updatedPostInput.shortDescription);
  expect(response.content).toBe(updatedPostInput.content);
  expect(response.blogId).toBe(blogId);
  expect(response.blogName).toBe(blogName);
  expect(response.createdAt).toBeDefined();
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
//   "likesCount": 0,
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
