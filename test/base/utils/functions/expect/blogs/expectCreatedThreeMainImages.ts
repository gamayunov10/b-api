export const expectCreatedThreeMainImages = (response, postId: string) => {
  const original = {
    url: `${process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN}post/images/main/${postId}_original_white940-432.jpg`,
    width: 940,
    height: 432,
    fileSize: 10220,
  };

  const middle = {
    url: `${process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN}post/images/main/${postId}_middle_white940-432.jpg`,
    width: 300,
    height: 180,
    fileSize: 3362,
  };

  const small = {
    url: `${process.env.S3_BUCKET_NAME_PLUS_S3_DOMAIN}post/images/main/${postId}_small_white940-432.jpg`,
    width: 149,
    height: 96,
    fileSize: 1470,
  };

  expect(response.body).toHaveProperty('main');
  expect(response.body.main).toBeInstanceOf(Array);

  const originalImage = response.body.main[0];

  expect(originalImage).toHaveProperty('url');
  expect(originalImage.url).toBe(original.url);
  expect(originalImage).toHaveProperty('width');
  expect(originalImage.width).toBe(original.width);
  expect(originalImage).toHaveProperty('height');
  expect(originalImage.height).toBe(original.height);
  expect(originalImage).toHaveProperty('fileSize');
  expect(originalImage.fileSize).toBe(original.fileSize);

  const middleImage = response.body.main[1];

  expect(middleImage).toHaveProperty('url');
  expect(middleImage.url).toBe(middle.url);
  expect(middleImage).toHaveProperty('width');
  expect(middleImage.width).toBe(middle.width);
  expect(middleImage).toHaveProperty('height');
  expect(middleImage.height).toBe(middle.height);
  expect(middleImage).toHaveProperty('fileSize');
  expect(middleImage.fileSize).toBe(middle.fileSize);

  const smallImage = response.body.main[2];

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
//   "main": [
//   {
//     "url": "string",
//     "width": 0,
//     "height": 0,
//     "fileSize": 0
//   }
// ]
// }
