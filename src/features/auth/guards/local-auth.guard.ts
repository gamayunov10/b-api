import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StrategyType } from 'src/base/enums/strategy-type.enum';

@Injectable()
export class LocalAuthGuard extends AuthGuard(StrategyType.LOCAL) {}
