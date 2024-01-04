export const expectErrorsMessages = (response, field) => {
  expect(response.body).toHaveProperty('errorsMessages');
  expect(response.body.errorsMessages).toBeInstanceOf(Array);

  const firstErrorMessage = response.body.errorsMessages[0];

  expect(firstErrorMessage).toHaveProperty('message');
  expect(firstErrorMessage).toHaveProperty('field');

  expect(typeof firstErrorMessage.message).toBe('string');
  expect(firstErrorMessage.field).toBe(field);
};

// Example

// {
//   "errorsMessages": [
//   {
//     "message": "string",
//     "field": "string"
//   }
// ]
// }
