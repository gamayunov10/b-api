export const expectFirstPaginatedQuestion = (
  response: any,
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  body: string,
  correctAnswers: string,
  published: boolean,
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

  expect(firstQuestion).toHaveProperty('id');
  expect(firstQuestion).toHaveProperty('body');
  expect(firstQuestion.body).toBe(body);

  expect(firstQuestion).toHaveProperty('correctAnswers');
  expect(firstQuestion.correctAnswers).toBeInstanceOf(Array);
  expect(firstQuestion.correctAnswers[0]).toBe(correctAnswers);

  expect(firstQuestion).toHaveProperty('published');
  expect(firstQuestion.published).toBe(published);

  expect(firstQuestion).toHaveProperty('createdAt');
  expect(firstQuestion.createdAt).toBeDefined();

  expect(firstQuestion).toHaveProperty('updatedAt');
  expect(firstQuestion.updatedAt).toBeDefined();
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
//     "createdAt": "2024-01-28T07:11:30.151Z",
//     "updatedAt": "2024-01-28T07:11:30.151Z"
//   }
// ]
// }
