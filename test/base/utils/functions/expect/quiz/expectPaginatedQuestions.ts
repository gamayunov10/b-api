export const expectPaginatedQuestions = (
  response: any,
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  body: string,
  correctAnswers: string,
  published: boolean,
  // body_q_index: string,
  // correctAnswers_q_index: string,
  // published_q_index: boolean,
  // q_index: number,
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

  const firstQuestion = response.body.items[0];
  // const secondQuestion = response.body.items[1];
  // const thirdQuestion = response.body.items[2];
  // const fourthQuestion = response.body.items[3];
  // const fifthQuestion = response.body.items[4];
  // const sixthQuestion = response.body.items[5];
  // const indexQuestion = response.body.items[q_index];

  expect(firstQuestion).toHaveProperty('id');
  expect(firstQuestion).toHaveProperty('body');

  expect(firstQuestion).toHaveProperty('correctAnswers');
  expect(firstQuestion.correctAnswers).toBeInstanceOf(Array);

  expect(firstQuestion).toHaveProperty('published');

  expect(firstQuestion).toHaveProperty('createdAt');
  expect(firstQuestion.createdAt).toBeDefined();

  expect(firstQuestion).toHaveProperty('updatedAt');
  expect(firstQuestion.updatedAt).toBeDefined();

  expect(firstQuestion.id).toBeDefined();
  expect(firstQuestion.body).toBe(body);
  expect(firstQuestion.correctAnswers[0]).toBe(correctAnswers);
  expect(firstQuestion.published).toBe(published);

  // expect(indexQuestion.body).toBe(body_q_index);
  // expect(indexQuestion.correctAnswers[0]).toBe(correctAnswers_q_index);
  // expect(indexQuestion.published).toBe(published_q_index);
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
//     "body": "string",
//     "correctAnswers": [
//       "string"
//     ],
//     "published": false,
//     "createdAt": "2024-01-28T07:55:04.944Z",
//     "updatedAt": "2024-01-28T07:55:04.944Z"
//   }
// ]
// }
