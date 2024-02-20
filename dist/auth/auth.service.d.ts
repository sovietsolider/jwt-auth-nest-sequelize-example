import { AuthSigninDto, AuthSignupDto } from './dto';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private jwtService;
    private config;
    constructor(jwtService: JwtService, config: ConfigService);
    signup(dto: AuthSignupDto): Promise<Tokens>;
    signin(dto: AuthSigninDto): Promise<Tokens>;
    logout(userId: number): Promise<void>;
    refreshTokens(userId: number, refreshToken: string): Promise<Tokens>;
    generateArgonHash(data: string): Promise<string>;
    updateRefreshTokenHash(userId: number, refreshToken: string): Promise<void>;
    generateTokens(userId: number, email: string): Promise<Tokens>;
}
