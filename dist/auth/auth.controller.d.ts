import { AuthService } from './auth.service';
import { AuthSigninDto, AuthSignupDto } from './dto';
import { Tokens } from './types';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signup(dto: AuthSignupDto): Promise<Tokens>;
    signIn(dto: AuthSigninDto): Promise<Tokens>;
    logout(userId: number): Promise<void>;
    refreshTokens(userId: number, refreshToken: string): Promise<Tokens>;
}
