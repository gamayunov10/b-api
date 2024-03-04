import process from 'process';

export const expectCreatedMainImage156x156 = (response, blogId: string) => {
  const expectedData = {
    url: `${process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN}blogger/images/main/${blogId}_node-156.png`,
    width: 156,
    height: 156,
    fileSize: 1925,
  };

  expect(response.body).toHaveProperty('wallpaper');
  expect(response.body.wallpaper).toBeNull();

  expect(response.body).toHaveProperty('main');
  expect(response.body.main).toHaveProperty('url');
  expect(response.body.main.url).toBe(expectedData.url);
  expect(response.body.main).toHaveProperty('width');
  expect(response.body.main.width).toBe(expectedData.width);
  expect(response.body.main).toHaveProperty('height');
  expect(response.body.main.height).toBe(expectedData.height);
  expect(response.body.main).toHaveProperty('fileSize');
  expect(response.body.main.fileSize).toBe(expectedData.fileSize);
};

// Example

// {
//   "wallpaper": null,
//   "main": [
//   {
//     "url": "string",
//     "width": 0,
//     "height": 0,
//     "fileSize": 0
//   }
// ]
// }
