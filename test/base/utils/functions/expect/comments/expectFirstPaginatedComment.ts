export const expectFirstPaginatedComment = (
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
