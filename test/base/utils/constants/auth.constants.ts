import { randomUUID } from 'crypto';

export const basicAuthLogin = 'admin';
export const basicAuthPassword = 'qwerty';
export const set_cookie = 'set-cookie';

export const someSiteURl = 'https://some-site.com';
export const someSiteURl2 = 'https://some-2-site.com';
export const someSiteURl3 = 'https://some-3-site.com';
export const someSiteURl4 = 'https://some-4-site.com';
export const someSiteURl5 = 'https://some-5-site.com';
export const someSiteURl6 = 'https://some-6-site.com';
export const someSiteURl7 = 'https://some-7-site.com';
export const updatedSomeSiteURl = 'https://some-updated-site.com';

export const userAgent1 =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36';
export const userAgent2 =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:94.0) Gecko/20100101 Firefox/94.0';
export const userAgent3 =
  'Mozilla/5.0 (Linux; Android 10; SM-G960F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.86 Mobile App Android';
export const userAgent4 =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
export const userAgent5 =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

export const customIpAddress = '7';

export const registrationInputDto = {
  login: 'login1',
  password: 'password123',
  email: 'some@gmail.com',
};

export const invalidAccessToken = `accessToken=${randomUUID()}`;
export const invalidRefreshToken = `refreshToken=${randomUUID()}`;
export const invalidConfirmationCode = randomUUID();
export const expiredAccessToken = `accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTgwMjI1MjA1MmI4ZTJjZGUwNzgxYzIiLCJpYXQiOjE3MDI4OTYyMTAsImV4cCI6MTcwMjg5OTgxMH0.DiIAJgMRXzrVwdWFSBSh2PZzI7L-1HQUJk6F-1w7C1U`;
export const randomAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTgwMjI1MjA1MmI4ZTJjZGUwNzgxYzIiLCJpYXQiOjE3MDI4OTYyMTAsImV4cCI6MTcwMjg5OTgxMH0.DiIAJgMRXzrVwdWFSBSh2PZzI7L-1HQUJk6F-1w7C1U';

export const expiredRefreshToken =
  'refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMzczIiwiZGV2aWNlSWQiOiIyNWJjNGFjOC1kNTM1LTRhYmEtYTI5YS05Y2JmOTMxNjJiN2QiLCJpYXQiOjE3MDQwMDY4NjUsImV4cCI6MTcwNDAwNjg4NX0.jVHZoH9UidOTP1ihNmVTiomZyU3J8k4X6E9cFdxSMbU';
