import process from 'process';

export const expectCreatedWallpaper = (response, blogId: string) => {
  const expectedData = {
    url: `${process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN}blogger/images/wallpapers/${blogId}_1028-312-wp.jpg`,
    width: 1028,
    height: 312,
    fileSize: 24607,
  };

  expect(response.body).toHaveProperty('wallpaper');
  expect(response.body.wallpaper).toHaveProperty('url');
  expect(response.body.wallpaper.url).toBe(expectedData.url);
  expect(response.body.wallpaper).toHaveProperty('width');
  expect(response.body.wallpaper.width).toBe(expectedData.width);
  expect(response.body.wallpaper).toHaveProperty('height');
  expect(response.body.wallpaper.height).toBe(expectedData.height);
  expect(response.body.wallpaper).toHaveProperty('fileSize');
  expect(response.body.wallpaper.fileSize).toBe(expectedData.fileSize);

  expect(response.body).toHaveProperty('main');
  expect(response.body.main).toBeInstanceOf(Array);
};

// Example

// {
//   wallpaper: {
//     url: 'https://storage.yandexcloud.net/blogger/images/wallpapers/291_1028-312-wp.jpg',
//       width: 1028,
//       height: 312,
//       fileSize: 24607
//   },
//   main: []
// }
