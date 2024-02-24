import { ApiProperty } from '@nestjs/swagger';

export class BanInfoViewModel {
  @ApiProperty({ type: Boolean })
  isBanned: boolean;

  @ApiProperty({ type: Date || null })
  banDate: Date | null;

  @ApiProperty({ type: String || null })
  banReason: string | null;
}
