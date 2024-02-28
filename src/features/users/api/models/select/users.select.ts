export interface IUsersSelect {
  id: number;
  login: string;
  email: string;
  createdAt: Date;
  isBanned: boolean;
  banDate: Date | null;
  banReason: string | null;
}
