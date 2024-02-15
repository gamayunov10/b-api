import { GameStatuses } from '../../../../../../src/base/enums/game-statuses';

export const expectCreatedPair = (
  response,
  id1: number,
  firstUserLogin: string,
  id2: number,
  secondUserLogin: string,
  playerScoreOne = 0,
  playerScoreTwo = 0,
  gameStatus: string = GameStatuses.ACTIVE,
) => {
  const firstUserId = id1.toString();
  const secondUserId = id2.toString();
  expect(response.body).toHaveProperty('id');

  expect(response.body).toHaveProperty('firstPlayerProgress');
  expect(response.body.firstPlayerProgress).toBeInstanceOf(Object);

  expect(response.body.firstPlayerProgress).toHaveProperty('answers');
  expect(response.body.firstPlayerProgress.answers).toBeInstanceOf(Array);

  expect(response.body.firstPlayerProgress).toHaveProperty('player');
  expect(response.body.firstPlayerProgress.player).toBeInstanceOf(Object);
  expect(response.body.firstPlayerProgress.player.id).toBe(firstUserId);
  expect(response.body.firstPlayerProgress.player.login).toBe(firstUserLogin);

  expect(response.body.firstPlayerProgress).toHaveProperty('score');
  expect(response.body.firstPlayerProgress.score).toBe(playerScoreOne);

  expect(response.body).toHaveProperty('secondPlayerProgress');
  expect(response.body.secondPlayerProgress).toBeInstanceOf(Object);

  expect(response.body.secondPlayerProgress).toHaveProperty('answers');
  expect(response.body.secondPlayerProgress.answers).toBeInstanceOf(Array);

  expect(response.body.secondPlayerProgress).toHaveProperty('player');
  expect(response.body.secondPlayerProgress.player).toBeInstanceOf(Object);
  expect(response.body.secondPlayerProgress.player.id).toBe(secondUserId);
  expect(response.body.secondPlayerProgress.player.login).toBe(secondUserLogin);

  expect(response.body.secondPlayerProgress).toHaveProperty('score');
  expect(response.body.secondPlayerProgress.score).toBe(playerScoreTwo);

  expect(response.body).toHaveProperty('questions');
  expect(response.body.questions).toBeInstanceOf(Array);

  expect(response.body).toHaveProperty('status');
  expect(response.body.status).toBe(gameStatus);

  expect(response.body).toHaveProperty('pairCreatedDate');
  expect(response.body.pairCreatedDate).not.toBeNull();

  expect(response.body).toHaveProperty('startGameDate');
  expect(response.body.startGameDate).not.toBeNull();

  expect(response.body).toHaveProperty('finishGameDate');
  expect(response.body.finishGameDate).toBeDefined();
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
