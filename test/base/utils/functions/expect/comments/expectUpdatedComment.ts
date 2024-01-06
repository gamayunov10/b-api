import { CommentInputModel } from '../../../../../../src/features/comments/api/models/input/comment-input.model';

export const expectUpdatedComment = (
  response,
  commentInputModel: CommentInputModel,
  userId: string,
  userLogin: string,
) => {
  expect(response).toHaveProperty('id');
  expect(response).toHaveProperty('content');
  expect(response).toHaveProperty('commentatorInfo');
  expect(response.commentatorInfo).toBeInstanceOf(Object);
  expect(response.commentatorInfo).toHaveProperty('userId');
  expect(response.commentatorInfo).toHaveProperty('userLogin');
  expect(response).toHaveProperty('createdAt');
  expect(response).toHaveProperty('likesInfo');
  expect(response.likesInfo).toBeInstanceOf(Object);
  expect(response.likesInfo).toHaveProperty('likesCount');
  expect(response.likesInfo).toHaveProperty('dislikesCount');
  expect(response.likesInfo).toHaveProperty('myStatus');

  expect(response.id).toBeDefined();
  expect(response.content).toBe(commentInputModel.content);
  expect(response.commentatorInfo.userId).toBe(userId);
  expect(response.commentatorInfo.userLogin).toBe(userLogin);
  expect(response.createdAt).toBeDefined();
  expect(response.likesInfo.likesCount).toBe(0);
  expect(response.likesInfo.dislikesCount).toBe(0);
  expect(response.likesInfo.myStatus).toBe('None');
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
