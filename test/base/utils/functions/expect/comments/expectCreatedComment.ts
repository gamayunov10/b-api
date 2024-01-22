import { CommentInputModel } from '../../../../../../src/features/comments/api/models/input/comment-input.model';

export const expectCreatedComment = (
  response,
  commentInputModel: CommentInputModel,
  userId: string,
  userLogin: string,
) => {
  expect(response.body).toHaveProperty('id');
  expect(response.body).toHaveProperty('content');
  expect(response.body).toHaveProperty('commentatorInfo');
  expect(response.body.commentatorInfo).toBeInstanceOf(Object);
  expect(response.body.commentatorInfo).toHaveProperty('userId');
  expect(response.body.commentatorInfo).toHaveProperty('userLogin');
  expect(response.body).toHaveProperty('createdAt');
  expect(response.body).toHaveProperty('likesInfo');
  expect(response.body.likesInfo).toBeInstanceOf(Object);
  expect(response.body.likesInfo).toHaveProperty('likesCount');
  expect(response.body.likesInfo).toHaveProperty('dislikesCount');
  expect(response.body.likesInfo).toHaveProperty('myStatus');

  expect(response.body.id).toBeDefined();
  expect(response.body.content).toBe(commentInputModel.content);
  expect(response.body.commentatorInfo.userId).toBe(userId);
  expect(response.body.commentatorInfo.userLogin).toBe(userLogin);
  expect(response.body.createdAt).toBeDefined();
  expect(response.body.likesInfo.likesCount).toBe(0);
  expect(response.body.likesInfo.dislikesCount).toBe(0);
  expect(response.body.likesInfo.myStatus).toBe('None');
};

// Example

// {
//   "id": "string",
//   "content": "string",
//   "commentatorInfo": {
//   "userId": "string",
//     "userLogin": "string"
// },
//   "createdAt": "2024-01-06T09:18:44.993Z",
//   "likesInfo": {
//   "likesCount": 0,
//     "dislikesCount": 0,
//     "myStatus": "None"
// }
// }
