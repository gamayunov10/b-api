export const usersFilter = (login: string, email: string) => {
  let loginFilter = '%';
  let emailFilter = '%';

  if (login && !email) {
    loginFilter = `%${login}%`;
    emailFilter = '';
  }

  if (!login && email) {
    loginFilter = '';
    emailFilter = `%${email}%`;
  }

  if (login && email) {
    loginFilter = `%${login}%`;
    emailFilter = `%${email}%`;
  }

  return {
    login: loginFilter,
    email: emailFilter,
  };
};
