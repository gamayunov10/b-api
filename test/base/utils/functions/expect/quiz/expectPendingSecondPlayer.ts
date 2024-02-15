import { GameStatuses } from '../../../../../../src/base/enums/game-statuses';

export const expectPendingSecondPlayer = (
  response,
  id: number,
  userLogin: string,
) => {
  const userId = id.toString();

  expect(response.body).toHaveProperty('id');

  expect(response.body).toHaveProperty('firstPlayerProgress');
  expect(response.body.firstPlayerProgress).toBeInstanceOf(Object);

  expect(response.body.firstPlayerProgress).toHaveProperty('answers');
  expect(response.body.firstPlayerProgress.answers).toBeInstanceOf(Array);

  expect(response.body.firstPlayerProgress).toHaveProperty('player');
  expect(response.body.firstPlayerProgress.player).toBeInstanceOf(Object);
  expect(response.body.firstPlayerProgress.player.id).toBe(userId);
  expect(response.body.firstPlayerProgress.player.login).toBe(userLogin);

  expect(response.body.firstPlayerProgress).toHaveProperty('score');
  expect(response.body.firstPlayerProgress.score).toBe(0);

  expect(response.body).toHaveProperty('secondPlayerProgress');
  expect(response.body.secondPlayerProgress).toBe(null);

  expect(response.body).toHaveProperty('questions');
  expect(response.body.questions).toBe(null);

  expect(response.body).toHaveProperty('status');
  expect(response.body.status).toBe(GameStatuses.PENDING_SECOND_PLAYER);

  expect(response.body).toHaveProperty('pairCreatedDate');
  expect(response.body.pairCreatedDate).toBeDefined();

  expect(response.body).toHaveProperty('startGameDate');
  expect(response.body.startGameDate).toBe(null);

  expect(response.body).toHaveProperty('finishGameDate');
  expect(response.body.finishGameDate).toBe(null);
};

// Example

// {
//   "id": "string",
//   "firstPlayerProgress": {
//   "answers": [
//     {
//       "questionId": "string",
//       "answerStatus": "Correct",
//       "addedAt": "2024-01-29T12:40:40.991Z"
//     }
//   ],
//     "player": {
//     "id": "string",
//       "login": "string"
//   },
//   "score": 0
// },
//   "secondPlayerProgress": {
//   "answers": [
//     {
//       "questionId": "string",
//       "answerStatus": "Correct",
//       "addedAt": "2024-01-29T12:40:40.991Z"
//     }
//   ],
//     "player": {
//     "id": "string",
//       "login": "string"
//   },
//   "score": 0
// },
//   "questions": [
//   {
//     "id": "string",
//     "body": "string"
//   }
// ],
//   "status": "PendingSecondPlayer",
//   "pairCreatedDate": "2024-01-29T12:40:40.991Z",
//   "startGameDate": "2024-01-29T12:40:40.991Z",
//   "finishGameDate": "2024-01-29T12:40:40.991Z"
// }
