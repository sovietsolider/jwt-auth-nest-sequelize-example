import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthSigninDto, AuthSignupDto } from './dto';
import * as argon2 from 'argon2';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/models/User';
import { Op } from 'sequelize';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) { }

  // `Signup` Route
  async signup(dto: AuthSignupDto): Promise<Tokens> {
    const password = await this.generateArgonHash(dto.password);
    const newUser = await User.create({
      email: dto.email,
      password,
    });

    const tokens: Tokens = await this.generateTokens(
      newUser.id,
      newUser.email,
    );

    await this.updateRefreshTokenHash(newUser.id, tokens.refresh_token);
    return tokens;
    //обработать уже существующий email
  }

  // `SignIn` Route
  async signin(dto: AuthSigninDto): Promise<Tokens> {
    const user = await User.findOne({
      where: { email: dto.email },
    });

    if (!user) throw new ForbiddenException('Access Denied');

    const passwordMatches = await argon2.verify(user.password, dto.password);
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    const tokens: Tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }

  // `Logout` Route
  async logout(userId: number) {
    await User.update({refreshToken: null}, {
      where: {
        id: userId,
        refreshToken: {
          [Op.not]: null
        }
      }
    });
  }

  // `RefreshToken` Route
  async refreshTokens(userId: number, refreshToken: string) {
    const user = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (!user || !user.refreshToken) throw new ForbiddenException('Access Denied');

    const refreshTokenMatches = await argon2.verify(
      user.refreshToken,
      refreshToken,
    );

    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');

    const tokens: Tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }

  /* --- Utility Functions --- */

  async generateArgonHash(data: string): Promise<string> {
    return await argon2.hash(data);
  }

  async updateRefreshTokenHash(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const hash = await this.generateArgonHash(refreshToken);
    await User.update({refreshToken: hash}, {
      where: { id: userId }
    });
  }

  async generateTokens(userId: number, email: string): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.config.get('JWT_ACCESS_TOKEN_SECRET_KEY'),
          expiresIn: this.config.get('ACCESS_TOKEN_LIFE_TIME') * 60,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.config.get('JWT_REFRESH_TOKEN_SECRET_KEY'),
          expiresIn: this.config.get('REFRESH_TOKEN_LIFE_TIME') * 24 * 60 * 60,
        },
      ),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
