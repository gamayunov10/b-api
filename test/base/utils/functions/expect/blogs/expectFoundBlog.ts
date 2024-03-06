import { BlogInputModel } from '../../../../../../src/features/blogs/api/models/input/blog-input-model';
import { SubscribeStatus } from '../../../../../../src/base/enums/SubscribeStatus.enum';

export const expectFoundBlog = (
  response,
  createBlogInput: BlogInputModel,
  subscribeStatus: SubscribeStatus,
  subscribersCount: number,
) => {
  expect(response.body).toHaveProperty('id');
  expect(response.body).toHaveProperty('name');
  expect(response.body).toHaveProperty('description');
  expect(response.body).toHaveProperty('websiteUrl');
  expect(response.body).toHaveProperty('createdAt');
  expect(response.body).toHaveProperty('isMembership');

  expect(response.body.id).toBeDefined();
  expect(response.body.name).toBe(createBlogInput.name);
  expect(response.body.description).toBe(createBlogInput.description);
  expect(response.body.websiteUrl).toBe(createBlogInput.websiteUrl);
  expect(response.body.createdAt).toBeDefined();
  expect(response.body.isMembership).toBeFalsy();

  expect(response.body).toHaveProperty('currentUserSubscriptionStatus');
  expect(response.body.currentUserSubscriptionStatus).toBe(subscribeStatus);

  expect(response.body).toHaveProperty('subscribersCount');
  expect(response.body.subscribersCount).toBe(subscribersCount);
};

// Example

// {
//   "id": "string",
//   "name": "string",
//   "description": "string",
//   "websiteUrl": "string",
//   "createdAt": "2024-03-05T14:26:06.281Z",
//   "isMembership": true,
//   "images": {
//   "wallpaper": {
//     "url": "string",
//       "width": 0,
//       "height": 0,
//       "fileSize": 0
//   },
//   "main": [
//     {
//       "url": "string",
//       "width": 0,
//       "height": 0,
//       "fileSize": 0
//     }
//   ]
// },
//   "currentUserSubscriptionStatus": "Subscribed",
//   "subscribersCount": 0
// }
