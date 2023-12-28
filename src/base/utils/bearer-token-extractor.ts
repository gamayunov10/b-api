export const bearerTokenExtractor = function (req) {
  let token = null;
  const authHeader = req.headers.authorization;

  if (authHeader && typeof authHeader === 'string') {
    const parts = authHeader.split(' ');

    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      token = parts[1];
    }
  }

  return token;
};
