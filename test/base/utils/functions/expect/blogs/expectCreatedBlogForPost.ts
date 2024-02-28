import { PostInputModel } from '../../../../../../src/features/posts/api/models/input/post-input-model';

export const expectCreatedBlogForPost = (
  response: any,
  createPostInput: PostInputModel,
  blogId: number,
  blogName: string,
  likesCount: number,
  dislikesCount: number,
  myStatus: string,
  newestLikesLogin?: string,
  newestLikesUser?: string,
) => {
  expect(response.body).toHaveProperty('id');
  expect(response.body.id).toBeDefined();

  expect(response.body).toHaveProperty('title');
  expect(response.body.title).toBe(createPostInput.title);

  expect(response.body).toHaveProperty('shortDescription');
  expect(response.body.shortDescription).toBe(createPostInput.shortDescription);

  expect(response.body).toHaveProperty('content');
  expect(response.body.content).toBe(createPostInput.content);

  expect(response.body).toHaveProperty('blogId');
  expect(response.body.blogId).toBe(blogId);

  expect(response.body).toHaveProperty('blogName');
  expect(response.body.blogName).toBe(blogName);

  expect(response.body).toHaveProperty('createdAt');
  expect(response.body.createdAt).toBeDefined();

  expect(response.body).toHaveProperty('extendedLikesInfo');
  expect(response.body.extendedLikesInfo).toBeInstanceOf(Object);
  expect(response.body.extendedLikesInfo).toHaveProperty('likesCount');
  expect(response.body.extendedLikesInfo.likesCount).toBe(likesCount);

  expect(response.body.extendedLikesInfo).toHaveProperty('dislikesCount');
  expect(response.body.extendedLikesInfo.dislikesCount).toBe(dislikesCount);

  expect(response.body.extendedLikesInfo).toHaveProperty('myStatus');
  expect(response.body.extendedLikesInfo.myStatus).toBe(myStatus);

  expect(response.body.extendedLikesInfo).toHaveProperty('newestLikes');
  expect(response.body.extendedLikesInfo.newestLikes).toBeInstanceOf(Array);

  if (newestLikesLogin && newestLikesUser) {
    expect(response.body.extendedLikesInfo.newestLikes).toHaveProperty(
      'addedAt',
    );
    expect(response.body.extendedLikesInfo.newestLikes).toHaveProperty(
      'userId',
    );
    expect(response.body.extendedLikesInfo.newestLikes.userId).toBe(
      newestLikesUser,
    );

    expect(response.body.extendedLikesInfo.newestLikes).toHaveProperty('login');
    expect(response.body.extendedLikesInfo.newestLikes.login).toBe(
      newestLikesLogin,
    );
  }
};

// Example

// {
//   "id": "string",
//   "title": "string",
//   "shortDescription": "string",
//   "content": "string",
//   "blogId": "string",
//   "blogName": "string",
//   "createdAt": "2024-02-27T08:12:42.499Z",
//   "extendedLikesInfo": {
//     "likesCount": 0,
//     "dislikesCount": 0,
//     "myStatus": "None",
//     "newestLikes": [
//     {
//       "addedAt": "2024-02-27T08:12:42.499Z",
//       "userId": "string",
//       "login": "string"
//     }
//   ]
// }
// }
