import { SubscribeStatus } from '../../../../../base/enums/SubscribeStatus.enum';

export interface IBlogsSelect {
  id: number;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
  bwi_url: string | null;
  bwi_width: number | null;
  bwi_height: number | null;
  bwi_size: number | null;
  subscribeStatus: SubscribeStatus;
  subscribeCount: number;
  mainImages:
    | [
        {
          url: string;
          width: number;
          height: number;
          size: number;
        },
      ]
    | [];
}
