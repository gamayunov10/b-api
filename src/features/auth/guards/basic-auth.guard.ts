import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StrategyType } from 'src/base/enums/strategy-type.enum';

@Injectable()
export class BasicAuthGuard extends AuthGuard(StrategyType.BASIC) {}
