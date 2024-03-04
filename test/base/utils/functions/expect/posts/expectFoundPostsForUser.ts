import process from 'process';

import { PostInputModel } from '../../../../../../src/features/posts/api/models/input/post-input-model';
import { LikesInfoViewModel } from '../../../../../../src/features/comments/api/models/output/likes-info-view.model';

export const expectFoundPostsForUser = (
  response,
  cretedBlog,
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  createPostInput: PostInputModel,
  likeInfo: LikesInfoViewModel,
) => {
  const main = {
    // url: `${process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN}post/images/main/${postId}_original_white940-432.jpg`,
    width: 940,
    height: 432,
    fileSize: 10220,
  };

  const middle = {
    // url: `${process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN}post/images/main/${postId}_middle_white940-432.jpg`,
    width: 300,
    height: 180,
    fileSize: 3362,
  };

  const small = {
    // url: `${process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN}post/images/main/${postId}_small_white940-432.jpg`,
    width: 149,
    height: 96,
    fileSize: 1470,
  };

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
  expect(firstPost.id).toBeDefined();

  expect(firstPost).toHaveProperty('title');
  expect(firstPost.title).toBe(createPostInput.title);

  expect(firstPost).toHaveProperty('shortDescription');
  expect(firstPost.shortDescription).toBe(createPostInput.shortDescription);

  expect(firstPost).toHaveProperty('content');
  expect(firstPost.content).toBe(createPostInput.content);

  expect(firstPost).toHaveProperty('blogId');
  expect(firstPost.blogId).toBe(cretedBlog.body.id);

  expect(firstPost).toHaveProperty('blogName');
  expect(firstPost.blogName).toBe(cretedBlog.body.name);

  expect(firstPost).toHaveProperty('createdAt');
  expect(firstPost.createdAt).toBeDefined();

  expect(firstPost).toHaveProperty('extendedLikesInfo');

  expect(firstPost.extendedLikesInfo).toHaveProperty('likesCount');
  expect(firstPost.extendedLikesInfo.likesCount).toBe(likeInfo.likesCount);

  expect(firstPost.extendedLikesInfo).toHaveProperty('dislikesCount');
  expect(firstPost.extendedLikesInfo.dislikesCount).toBe(
    likeInfo.dislikesCount,
  );

  expect(firstPost.extendedLikesInfo).toHaveProperty('myStatus');
  expect(firstPost.extendedLikesInfo.myStatus).toBe(likeInfo.myStatus);

  expect(firstPost.extendedLikesInfo).toHaveProperty('newestLikes');
  expect(firstPost.extendedLikesInfo.newestLikes).toBeInstanceOf(Array);

  expect(firstPost).toHaveProperty('images');

  expect(firstPost.images).toHaveProperty('main');
  const mainImage = firstPost.images.main[0];

  expect(mainImage).toHaveProperty('url');
  expect(mainImage.url).toBe(
    `${process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN}post/images/main/${firstPost.id}_original_white940-432.jpg`,
  );
  expect(mainImage).toHaveProperty('width');
  expect(mainImage.width).toBe(main.width);
  expect(mainImage).toHaveProperty('height');
  expect(mainImage.height).toBe(main.height);
  expect(mainImage).toHaveProperty('fileSize');
  expect(mainImage.fileSize).toBe(main.fileSize);

  const middleImage = firstPost.images.main[1];

  expect(middleImage).toHaveProperty('url');
  expect(middleImage.url).toBe(
    `${process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN}post/images/main/${firstPost.id}_middle_white940-432.jpg`,
  );
  expect(middleImage).toHaveProperty('width');
  expect(middleImage.width).toBe(middle.width);
  expect(middleImage).toHaveProperty('height');
  expect(middleImage.height).toBe(middle.height);
  expect(middleImage).toHaveProperty('fileSize');
  expect(middleImage.fileSize).toBe(middle.fileSize);

  const smallImage = firstPost.images.main[2];

  expect(smallImage).toHaveProperty('url');
  expect(smallImage.url).toBe(
    `${process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN}post/images/main/${firstPost.id}_small_white940-432.jpg`,
  );
  expect(smallImage).toHaveProperty('width');
  expect(smallImage.width).toBe(small.width);
  expect(smallImage).toHaveProperty('height');
  expect(smallImage.height).toBe(small.height);
  expect(smallImage).toHaveProperty('fileSize');
  expect(smallImage.fileSize).toBe(small.fileSize);
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
//     "createdAt": "2024-03-03T09:11:14.486Z",
//     "extendedLikesInfo": {
//       "likesCount": 0,
//       "dislikesCount": 0,
//       "myStatus": "None",
//       "newestLikes": [
//         {
//           "addedAt": "2024-03-03T09:11:14.486Z",
//           "userId": "string",
//           "login": "string"
//         }
//       ]
//     },
//     "images": {
//       "main": [
//         {
//           "url": "string",
//           "width": 0,
//           "height": 0,
//           "fileSize": 0
//         }
//       ]
//     }
//   }
// ]
// }
