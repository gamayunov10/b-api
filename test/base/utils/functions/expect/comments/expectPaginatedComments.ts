export const expectPaginatedComments = (
  response: any,
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  userId: string,
  userLogin: string,
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

  const firstComment = response.body.items[0];
  const secondComment = response.body.items[1];
  const thirdComment = response.body.items[2];
  const fourthComment = response.body.items[3];
  const fifthComment = response.body.items[4];
  const sixthComment = response.body.items[5];
  const seventhComment = response.body.items[6];

  expect(firstComment).toHaveProperty('id');
  expect(firstComment).toHaveProperty('content');
  expect(firstComment).toHaveProperty('commentatorInfo');
  expect(firstComment.likesInfo).toBeInstanceOf(Object);
  expect(firstComment).toHaveProperty('likesInfo');
  expect(firstComment.commentatorInfo).toBeInstanceOf(Object);

  expect(firstComment.commentatorInfo).toHaveProperty('userId');
  expect(firstComment.commentatorInfo).toHaveProperty('userLogin');
  expect(firstComment.commentatorInfo.userId).toBe(userId);
  expect(firstComment.commentatorInfo.userLogin).toBe(userLogin);
  expect(firstComment.createdAt).toBeDefined();
  expect(firstComment.likesInfo).toHaveProperty('likesCount');
  expect(firstComment.likesInfo).toHaveProperty('dislikesCount');
  expect(firstComment.likesInfo).toHaveProperty('myStatus');
  expect(firstComment.likesInfo.likesCount).toBe(0);
  expect(firstComment.likesInfo.dislikesCount).toBe(0);
  expect(firstComment.likesInfo.myStatus).toBe('None');

  expect(secondComment.commentatorInfo).toHaveProperty('userId');
  expect(secondComment.commentatorInfo).toHaveProperty('userLogin');
  expect(secondComment.commentatorInfo.userId).toBe(userId);
  expect(secondComment.commentatorInfo.userLogin).toBe(userLogin);
  expect(secondComment.createdAt).toBeDefined();
  expect(secondComment.likesInfo).toHaveProperty('likesCount');
  expect(secondComment.likesInfo).toHaveProperty('dislikesCount');
  expect(secondComment.likesInfo).toHaveProperty('myStatus');
  expect(secondComment.likesInfo.likesCount).toBe(0);
  expect(secondComment.likesInfo.dislikesCount).toBe(0);
  expect(secondComment.likesInfo.myStatus).toBe('None');

  expect(thirdComment.commentatorInfo).toHaveProperty('userId');
  expect(thirdComment.commentatorInfo).toHaveProperty('userLogin');
  expect(thirdComment.commentatorInfo.userId).toBe(userId);
  expect(thirdComment.commentatorInfo.userLogin).toBe(userLogin);
  expect(thirdComment.createdAt).toBeDefined();
  expect(thirdComment.likesInfo).toHaveProperty('likesCount');
  expect(thirdComment.likesInfo).toHaveProperty('dislikesCount');
  expect(thirdComment.likesInfo).toHaveProperty('myStatus');
  expect(thirdComment.likesInfo.likesCount).toBe(0);
  expect(thirdComment.likesInfo.dislikesCount).toBe(0);
  expect(thirdComment.likesInfo.myStatus).toBe('None');

  expect(fourthComment.commentatorInfo).toHaveProperty('userId');
  expect(fourthComment.commentatorInfo).toHaveProperty('userLogin');
  expect(fourthComment.commentatorInfo.userId).toBe(userId);
  expect(fourthComment.commentatorInfo.userLogin).toBe(userLogin);
  expect(fourthComment.createdAt).toBeDefined();
  expect(fourthComment.likesInfo).toHaveProperty('likesCount');
  expect(fourthComment.likesInfo).toHaveProperty('dislikesCount');
  expect(fourthComment.likesInfo).toHaveProperty('myStatus');
  expect(fourthComment.likesInfo.likesCount).toBe(0);
  expect(fourthComment.likesInfo.dislikesCount).toBe(0);
  expect(fourthComment.likesInfo.myStatus).toBe('None');

  expect(fifthComment.commentatorInfo).toHaveProperty('userId');
  expect(fifthComment.commentatorInfo).toHaveProperty('userLogin');
  expect(fifthComment.commentatorInfo.userId).toBe(userId);
  expect(fifthComment.commentatorInfo.userLogin).toBe(userLogin);
  expect(fifthComment.createdAt).toBeDefined();
  expect(fifthComment.likesInfo).toHaveProperty('likesCount');
  expect(fifthComment.likesInfo).toHaveProperty('dislikesCount');
  expect(fifthComment.likesInfo).toHaveProperty('myStatus');
  expect(fifthComment.likesInfo.likesCount).toBe(0);
  expect(fifthComment.likesInfo.dislikesCount).toBe(0);
  expect(fifthComment.likesInfo.myStatus).toBe('None');

  expect(sixthComment.commentatorInfo).toHaveProperty('userId');
  expect(sixthComment.commentatorInfo).toHaveProperty('userLogin');
  expect(sixthComment.commentatorInfo.userId).toBe(userId);
  expect(sixthComment.commentatorInfo.userLogin).toBe(userLogin);
  expect(sixthComment.createdAt).toBeDefined();
  expect(sixthComment.likesInfo).toHaveProperty('likesCount');
  expect(sixthComment.likesInfo).toHaveProperty('dislikesCount');
  expect(sixthComment.likesInfo).toHaveProperty('myStatus');
  expect(sixthComment.likesInfo.likesCount).toBe(0);
  expect(sixthComment.likesInfo.dislikesCount).toBe(0);
  expect(sixthComment.likesInfo.myStatus).toBe('None');

  expect(seventhComment.commentatorInfo).toHaveProperty('userId');
  expect(seventhComment.commentatorInfo).toHaveProperty('userLogin');
  expect(seventhComment.commentatorInfo.userId).toBe(userId);
  expect(seventhComment.commentatorInfo.userLogin).toBe(userLogin);
  expect(seventhComment.createdAt).toBeDefined();
  expect(seventhComment.likesInfo).toHaveProperty('likesCount');
  expect(seventhComment.likesInfo).toHaveProperty('dislikesCount');
  expect(seventhComment.likesInfo).toHaveProperty('myStatus');
  expect(seventhComment.likesInfo.likesCount).toBe(0);
  expect(seventhComment.likesInfo.dislikesCount).toBe(0);
  expect(seventhComment.likesInfo.myStatus).toBe('None');
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
//     "content": "string",
//     "commentatorInfo": {
//       "userId": "string",
//       "userLogin": "string"
//     },
//     "createdAt": "2024-01-06T12:29:16.973Z",
//     "likesInfo": {
//       "likesCount": 0,
//       "dislikesCount": 0,
//       "myStatus": "None"
//     }
//   }
// ]
// }
