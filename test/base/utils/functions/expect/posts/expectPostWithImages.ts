import { PostInputModel } from '../../../../../../src/features/posts/api/models/input/post-input-model';
import { LikesInfoViewModel } from '../../../../../../src/features/comments/api/models/output/likes-info-view.model';

export const expectPostWithImages = (
  createdPost,
  cretedBlog,
  createPostInput: PostInputModel,
  likeInfo: LikesInfoViewModel,
) => {
  const original = {
    url: `${process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN}post/images/main/${createdPost.body.id}_original_white940-432.jpg`,
    width: 940,
    height: 432,
    fileSize: 10220,
  };

  const middle = {
    url: `${process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN}post/images/main/${createdPost.body.id}_middle_white940-432.jpg`,
    width: 300,
    height: 180,
    fileSize: 3362,
  };

  const small = {
    url: `${process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN}post/images/main/${createdPost.body.id}_small_white940-432.jpg`,
    width: 149,
    height: 96,
    fileSize: 1470,
  };

  expect(createdPost.body).toHaveProperty('id');
  expect(createdPost.body).toHaveProperty('title');
  expect(createdPost.body).toHaveProperty('shortDescription');
  expect(createdPost.body).toHaveProperty('content');
  expect(createdPost.body).toHaveProperty('blogId');
  expect(createdPost.body).toHaveProperty('blogName');
  expect(createdPost.body).toHaveProperty('createdAt');
  expect(createdPost.body).toHaveProperty('extendedLikesInfo');
  expect(createdPost.body.extendedLikesInfo).toBeInstanceOf(Object);
  expect(createdPost.body.extendedLikesInfo).toHaveProperty('likesCount');
  expect(createdPost.body.extendedLikesInfo).toHaveProperty('dislikesCount');
  expect(createdPost.body.extendedLikesInfo).toHaveProperty('myStatus');
  expect(createdPost.body.extendedLikesInfo).toHaveProperty('newestLikes');
  expect(createdPost.body.extendedLikesInfo.newestLikes).toBeInstanceOf(Array);

  expect(createdPost.body.id).toBeDefined();
  expect(createdPost.body.title).toBe(createPostInput.title);
  expect(createdPost.body.shortDescription).toBe(
    createPostInput.shortDescription,
  );
  expect(createdPost.body.content).toBe(createPostInput.content);
  expect(createdPost.body.blogId).toBe(cretedBlog.body.id);
  expect(createdPost.body.blogName).toBe(cretedBlog.body.name);
  expect(createdPost.body.createdAt).toBeDefined();
  expect(createdPost.body.extendedLikesInfo.likesCount).toBe(
    likeInfo.likesCount,
  );
  expect(createdPost.body.extendedLikesInfo.dislikesCount).toBe(
    likeInfo.dislikesCount,
  );
  expect(createdPost.body.extendedLikesInfo.myStatus).toBe(likeInfo.myStatus);

  const originalImage = createdPost.body.images.main[0];

  expect(originalImage).toHaveProperty('url');
  expect(originalImage.url).toBe(original.url);
  expect(originalImage).toHaveProperty('width');
  expect(originalImage.width).toBe(original.width);
  expect(originalImage).toHaveProperty('height');
  expect(originalImage.height).toBe(original.height);
  expect(originalImage).toHaveProperty('fileSize');
  expect(originalImage.fileSize).toBe(original.fileSize);

  const middleImage = createdPost.body.images.main[1];

  expect(middleImage).toHaveProperty('url');
  expect(middleImage.url).toBe(middle.url);
  expect(middleImage).toHaveProperty('width');
  expect(middleImage.width).toBe(middle.width);
  expect(middleImage).toHaveProperty('height');
  expect(middleImage.height).toBe(middle.height);
  expect(middleImage).toHaveProperty('fileSize');
  expect(middleImage.fileSize).toBe(middle.fileSize);

  const smallImage = createdPost.body.images.main[2];

  expect(smallImage).toHaveProperty('url');
  expect(smallImage.url).toBe(small.url);
  expect(smallImage).toHaveProperty('width');
  expect(smallImage.width).toBe(small.width);
  expect(smallImage).toHaveProperty('height');
  expect(smallImage.height).toBe(small.height);
  expect(smallImage).toHaveProperty('fileSize');
  expect(smallImage.fileSize).toBe(small.fileSize);
};

// Example

// {
//   "id": "string",
//   "title": "string",
//   "shortDescription": "string",
//   "content": "string",
//   "blogId": "string",
//   "blogName": "string",
//   "createdAt": "2024-03-03T06:45:34.765Z",
//   "extendedLikesInfo": {
//     "likesCount": 0,
//     "dislikesCount": 0,
//     "myStatus": "None",
//     "newestLikes": [
//     {
//       "addedAt": "2024-03-03T06:45:34.765Z",
//       "userId": "string",
//       "login": "string"
//     }
//   ]
// },
//   "images": {
//     "main": [
//        {
//         "url": "string",
//         "width": 0,
//         "height": 0,
//         "fileSize": 0
//         }
//      ]
//    }
// }
