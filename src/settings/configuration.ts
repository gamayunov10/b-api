export default () => ({
  env: process.env.ENV || 'DEVELOPMENT',
  databaseUris: {
    prod: process.env.CONNECTION_URI,
    test: process.env.CONNECTION_URI_FOR_TESTS,
  },
});
