export const expectUpdatedQuestion = (
  response,
  body: string,
  correctAnswer: string,
) => {
  expect(response).toHaveProperty('id');
  expect(response).toHaveProperty('body');
  expect(response).toHaveProperty('correctAnswers');
  expect(response).toHaveProperty('published');
  expect(response).toHaveProperty('createdAt');
  expect(response).toHaveProperty('updatedAt');

  expect(response.id).toBeDefined();
  expect(response.body).toBe(body);
  expect(response.correctAnswers).toBeInstanceOf(Array);
  expect(response.correctAnswers[0]).toBe(correctAnswer);
  expect(response.published).toBeFalsy();
  expect(response.createdAt).toBeDefined();
  expect(response.published).toBeDefined();
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
