export const expecFilteredMessages = (response, statusCode, path) => {
  expect(response.body).toHaveProperty('statusCode');
  expect(response.body).toHaveProperty('timestamp');
  expect(response.body).toHaveProperty('path');

  expect(response.body.statusCode).toBe(statusCode);
  expect(response.body.timestamp).toBeDefined();
  expect(response.body.path).toBe(path);
};

// Example

// {
//   "statusCode": 401,
//   "timestamp": "2023-12-30T13:02:34.334Z",
//   "path": "/sa/users/"
// }
