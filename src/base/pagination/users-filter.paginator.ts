import { BanStatus } from '../enums/ban-status.enum';

export const usersFilter = (
  login: string,
  email: string,
  banStatus?: BanStatus,
) => {
  let loginFilter = '%';
  let emailFilter = '%';
  let isBannedFilter: boolean | undefined;

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

  if (banStatus === BanStatus.ALL) {
    isBannedFilter = undefined;
  }

  if (banStatus === BanStatus.NOT_BANNED) {
    isBannedFilter = false;
  }

  if (banStatus === BanStatus.BANNED) {
    isBannedFilter = true;
  }

  return {
    login: loginFilter,
    email: emailFilter,
    banStatus: isBannedFilter,
  };
};
