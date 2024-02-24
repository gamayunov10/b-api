export const expectGetPostById = (
  response,
  likesCount = 0,
  dislikesCount = 0,
  myStatus = 'None',
) => {
  expect(response.body).toHaveProperty('extendedLikesInfo');
  expect(response.body.extendedLikesInfo).toBeInstanceOf(Object);
  expect(response.body.extendedLikesInfo).toHaveProperty('likesCount');
  expect(response.body.extendedLikesInfo).toHaveProperty('dislikesCount');
  expect(response.body.extendedLikesInfo).toHaveProperty('myStatus');
  expect(response.body.extendedLikesInfo).toHaveProperty('newestLikes');
  expect(response.body.extendedLikesInfo.newestLikes).toBeInstanceOf(Array);

  expect(response.body.extendedLikesInfo.likesCount).toBe(likesCount);
  expect(response.body.extendedLikesInfo.dislikesCount).toBe(dislikesCount);
  expect(response.body.extendedLikesInfo.myStatus).toBe(myStatus);
};

// Example

// {
//   "extendedLikesInfo": {
//   "likesCount": 2,
//     "dislikesCount": 0,
//     "myStatus": "None",
//     "newestLikes": [
//     {
//       "addedAt": "2024-02-22T17:45:14.087829+00:00",
//       "userId": "2191",
//       "login": "login02"
//     },
//     {
//       "addedAt": "2024-02-22T17:45:14.072661+00:00",
//       "userId": "2190",
//       "login": "login01"
//     }
//   ]
// }
// }
