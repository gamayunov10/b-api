import { BanInfoViewModel } from './ban-info-view.model';

export class SuperAdminUserViewModel {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
  banInfo: BanInfoViewModel;
}
