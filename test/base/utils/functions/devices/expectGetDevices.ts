export const expectGetDevices = (response, deviceId) => {
  expect(response.body).toBeInstanceOf(Array);
  expect(response.body[0]).toHaveProperty('ip');
  expect(response.body[0]).toHaveProperty('title');
  expect(response.body[0]).toHaveProperty('lastActiveDate');
  expect(response.body[0]).toHaveProperty('deviceId');

  expect(response.body[0].ip).toBeDefined();
  expect(response.body[0].title).toBeDefined();
  expect(response.body[0].lastActiveDate).toBeDefined;
  expect(response.body[0].deviceId).toBe(deviceId);
};

// Example

// [
//   {
//     "ip": "string",
//     "title": "string",
//     "lastActiveDate": "string",
//     "deviceId": "string"
//   }
// ]
