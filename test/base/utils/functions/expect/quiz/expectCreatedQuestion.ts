export const expectCreatedQuestion = (
  response,
  body: string,
  correctAnswer: string,
) => {
  expect(response.body).toHaveProperty('id');
  expect(response.body).toHaveProperty('body');
  expect(response.body).toHaveProperty('correctAnswers');
  expect(response.body).toHaveProperty('published');
  expect(response.body).toHaveProperty('createdAt');
  expect(response.body).toHaveProperty('updatedAt');

  expect(response.body.id).toBeDefined();
  expect(response.body.body).toBe(body);
  expect(response.body.correctAnswers).toBeInstanceOf(Array);
  expect(response.body.correctAnswers[0]).toBe(correctAnswer);
  expect(response.body.published).toBeFalsy();
  expect(response.body.createdAt).toBeDefined();
  expect(response.body.published).toBeDefined();
};

// Example

// {
//   "id": "string",
//   "body": "string",
//   "correctAnswers": [
//   "string"
// ],
//   "published": false,
//   "createdAt": "2024-01-28T06:44:18.599Z",
//   "updatedAt": "2024-01-28T06:44:18.599Z"
// }
