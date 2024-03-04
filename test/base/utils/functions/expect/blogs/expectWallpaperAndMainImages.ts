import process from 'process';

export const expectWallpaperAndMainImages = (createdBlog, blogId: string) => {
  const wallpaper = {
    url: `${process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN}blogger/images/wallpapers/${blogId}_1028-312-wp.jpg`,
    width: 1028,
    height: 312,
    fileSize: 24607,
  };

  const main = {
    url: `${process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN}blogger/images/main/${blogId}_node-156.png`,
    width: 156,
    height: 156,
    fileSize: 1925,
  };

  expect(createdBlog.body).toHaveProperty('wallpaper');
  expect(createdBlog.body.wallpaper).toHaveProperty('url');
  expect(createdBlog.body.wallpaper.url).toBe(wallpaper.url);
  expect(createdBlog.body.wallpaper).toHaveProperty('width');
  expect(createdBlog.body.wallpaper.width).toBe(wallpaper.width);
  expect(createdBlog.body.wallpaper).toHaveProperty('height');
  expect(createdBlog.body.wallpaper.height).toBe(wallpaper.height);
  expect(createdBlog.body.wallpaper).toHaveProperty('fileSize');
  expect(createdBlog.body.wallpaper.fileSize).toBe(wallpaper.fileSize);

  expect(createdBlog.body).toHaveProperty('main');
  expect(createdBlog.body.main).toBeInstanceOf(Array);

  const mainImage = createdBlog.body.main[0];

  expect(mainImage).toHaveProperty('url');
  expect(mainImage.url).toBe(main.url);
  expect(mainImage).toHaveProperty('width');
  expect(mainImage.width).toBe(main.width);
  expect(mainImage).toHaveProperty('height');
  expect(mainImage.height).toBe(main.height);
  expect(mainImage).toHaveProperty('fileSize');
  expect(mainImage.fileSize).toBe(main.fileSize);
};

// Example

// {
//   "wallpaper": {
//     "url": "string",
//     "width": 0,
//     "height": 0,
//     "fileSize": 0
// },
//   "main": [
//   {
//     "url": "string",
//     "width": 0,
//     "height": 0,
//     "fileSize": 0
//   }
// ]
// }
