import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersQueryRepository } from '../../../../users/infrastructure/users.query.repository';

@Injectable()
export class AuthService {
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}

  async checkCredentials(loginOrEmail: string, password: string) {
    const user = await this.usersQueryRepository.findUserByLoginOrEmail(
      loginOrEmail,
    );

    if (!user) return null;

    if (!user.isConfirmed) return null;

    const isHashesEquals: boolean = await this._isPasswordCorrect(
      password,
      user.passwordHash,
    );

    return isHashesEquals ? user.id.toString() : null;
  }

  async _isPasswordCorrect(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
