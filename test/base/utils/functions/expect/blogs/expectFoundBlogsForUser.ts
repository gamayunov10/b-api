import process from 'process';

import { BlogInputModel } from '../../../../../../src/features/blogs/api/models/input/blog-input-model';

export const expectFoundBlogsForUser = (
  response,
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  createBlogInput: BlogInputModel,
) => {
  const main = {
    // url: `${process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN}blogger/images/main/${blogId}_node-156.png`,
    width: 156,
    height: 156,
    fileSize: 1925,
  };

  const wallpaper = {
    // url: `${process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN}blogger/images/wallpapers/${blogId}_1028-312-wp.jpg`,
    width: 1028,
    height: 312,
    fileSize: 24607,
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

  const firstBlog = response.body.items[0];

  expect(firstBlog).toHaveProperty('id');
  expect(firstBlog.id).toBeDefined();

  expect(firstBlog).toHaveProperty('name');
  expect(firstBlog.name).toBe(createBlogInput.name);

  expect(firstBlog).toHaveProperty('description');
  expect(firstBlog.description).toBe(createBlogInput.description);

  expect(firstBlog).toHaveProperty('websiteUrl');
  expect(firstBlog.websiteUrl).toBe(createBlogInput.websiteUrl);

  expect(firstBlog).toHaveProperty('createdAt');
  expect(firstBlog.createdAt).toBeDefined();

  expect(firstBlog).toHaveProperty('isMembership');
  expect(firstBlog.isMembership).toBeFalsy();

  expect(firstBlog).toHaveProperty('images');
  expect(firstBlog.images).toHaveProperty('wallpaper');
  expect(firstBlog.images.wallpaper).toHaveProperty('url');
  expect(firstBlog.images.wallpaper.url).toBe(
    `${process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN}blogger/images/wallpapers/${firstBlog.id}_1028-312-wp.jpg`,
  );
  expect(firstBlog.images.wallpaper).toHaveProperty('width');
  expect(firstBlog.images.wallpaper.width).toBe(wallpaper.width);
  expect(firstBlog.images.wallpaper).toHaveProperty('height');
  expect(firstBlog.images.wallpaper.height).toBe(wallpaper.height);
  expect(firstBlog.images.wallpaper).toHaveProperty('fileSize');
  expect(firstBlog.images.wallpaper.fileSize).toBe(wallpaper.fileSize);

  expect(firstBlog.images).toHaveProperty('main');
  const mainImage = firstBlog.images.main[0];

  expect(mainImage).toHaveProperty('url');
  expect(mainImage.url).toBe(
    `${process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN}blogger/images/main/${firstBlog.id}_node-156.png`,
  );
  expect(mainImage).toHaveProperty('width');
  expect(mainImage.width).toBe(main.width);
  expect(mainImage).toHaveProperty('height');
  expect(mainImage.height).toBe(main.height);
  expect(mainImage).toHaveProperty('fileSize');
  expect(mainImage.fileSize).toBe(main.fileSize);
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
//     "createdAt": "2024-03-03T08:19:16.293Z",
//     "isMembership": true,
//     "images": {
//       "wallpaper": {
//         "url": "string",
//         "width": 0,
//         "height": 0,
//         "fileSize": 0
//       },
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
