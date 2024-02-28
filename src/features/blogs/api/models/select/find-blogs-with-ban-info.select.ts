export interface IFindBlogsWithBanInfoSelect {
  id: number;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
  user: {
    id: number;
    login: string;
  };
  blogBan: {
    isBanned: boolean;
    banDate: Date | null;
  };
}
