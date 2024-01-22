import { PostInputModel } from '../../../../../../src/features/posts/api/models/input/post-input-model';

export const expectPaginatedPosts = (
  response: any,
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  createPostInput: PostInputModel,
  createPostInput2: PostInputModel,
  createPostInput3: PostInputModel,
  createPostInput4: PostInputModel,
  createPostInput5: PostInputModel,
  createPostInput6: PostInputModel,
  createPostInput7: PostInputModel,
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
  const secondPost = response.body.items[1];
  const thirdPost = response.body.items[2];
  const fourthPost = response.body.items[3];
  const fifthPost = response.body.items[4];
  const sixthPost = response.body.items[5];
  const seventhPost = response.body.items[6];

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

  expect(secondPost.id).toBeDefined();
  expect(secondPost.title).toBe(createPostInput2.title);
  expect(secondPost.shortDescription).toBe(createPostInput2.shortDescription);
  expect(secondPost.content).toBe(createPostInput2.content);
  expect(secondPost.blogId).toBe(blogId);
  expect(secondPost.blogName).toBe(blogName);
  expect(secondPost.createdAt).toBeDefined();
  expect(secondPost.extendedLikesInfo).toBeInstanceOf(Object);

  expect(thirdPost.id).toBeDefined();
  expect(thirdPost.title).toBe(createPostInput3.title);
  expect(thirdPost.shortDescription).toBe(createPostInput3.shortDescription);
  expect(thirdPost.content).toBe(createPostInput3.content);
  expect(thirdPost.blogId).toBe(blogId);
  expect(thirdPost.blogName).toBe(blogName);
  expect(thirdPost.createdAt).toBeDefined();
  expect(thirdPost.extendedLikesInfo).toBeInstanceOf(Object);

  expect(fourthPost.id).toBeDefined();
  expect(fourthPost.title).toBe(createPostInput4.title);
  expect(fourthPost.shortDescription).toBe(createPostInput4.shortDescription);
  expect(fourthPost.content).toBe(createPostInput4.content);
  expect(fourthPost.blogId).toBe(blogId);
  expect(fourthPost.blogName).toBe(blogName);
  expect(fourthPost.createdAt).toBeDefined();
  expect(fourthPost.extendedLikesInfo).toBeInstanceOf(Object);

  expect(fifthPost.id).toBeDefined();
  expect(fifthPost.title).toBe(createPostInput5.title);
  expect(fifthPost.shortDescription).toBe(createPostInput5.shortDescription);
  expect(fifthPost.content).toBe(createPostInput5.content);
  expect(fifthPost.blogId).toBe(blogId);
  expect(fifthPost.blogName).toBe(blogName);
  expect(fifthPost.createdAt).toBeDefined();
  expect(fifthPost.extendedLikesInfo).toBeInstanceOf(Object);

  expect(sixthPost.id).toBeDefined();
  expect(sixthPost.title).toBe(createPostInput6.title);
  expect(sixthPost.shortDescription).toBe(createPostInput6.shortDescription);
  expect(sixthPost.content).toBe(createPostInput6.content);
  expect(sixthPost.blogId).toBe(blogId);
  expect(sixthPost.blogName).toBe(blogName);
  expect(sixthPost.createdAt).toBeDefined();
  expect(sixthPost.extendedLikesInfo).toBeInstanceOf(Object);

  expect(seventhPost.id).toBeDefined();
  expect(seventhPost.title).toBe(createPostInput7.title);
  expect(seventhPost.shortDescription).toBe(createPostInput7.shortDescription);
  expect(seventhPost.content).toBe(createPostInput7.content);
  expect(seventhPost.blogId).toBe(blogId);
  expect(seventhPost.blogName).toBe(blogName);
  expect(seventhPost.createdAt).toBeDefined();
  expect(seventhPost.extendedLikesInfo).toBeInstanceOf(Object);
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
