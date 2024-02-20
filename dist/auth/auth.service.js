"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const argon2 = __importStar(require("argon2"));
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const User_1 = require("../models/User");
const sequelize_1 = require("sequelize");
let AuthService = class AuthService {
    constructor(jwtService, config) {
        this.jwtService = jwtService;
        this.config = config;
    }
    async signup(dto) {
        const password = await this.generateArgonHash(dto.password);
        const newUser = await User_1.User.create({
            email: dto.email,
            password,
        });
        const tokens = await this.generateTokens(newUser.id, newUser.email);
        await this.updateRefreshTokenHash(newUser.id, tokens.refresh_token);
        return tokens;
    }
    async signin(dto) {
        const user = await User_1.User.findOne({
            where: { email: dto.email },
        });
        if (!user)
            throw new common_1.ForbiddenException('Access Denied');
        const passwordMatches = await argon2.verify(user.password, dto.password);
        if (!passwordMatches)
            throw new common_1.ForbiddenException('Access Denied');
        const tokens = await this.generateTokens(user.id, user.email);
        await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
        return tokens;
    }
    async logout(userId) {
        await User_1.User.update({ refreshToken: null }, {
            where: {
                id: userId,
                refreshToken: {
                    [sequelize_1.Op.not]: null
                }
            }
        });
    }
    async refreshTokens(userId, refreshToken) {
        const user = await User_1.User.findOne({
            where: {
                id: userId,
            },
        });
        if (!user || !user.refreshToken)
            throw new common_1.ForbiddenException('Access Denied');
        const refreshTokenMatches = await argon2.verify(user.refreshToken, refreshToken);
        if (!refreshTokenMatches)
            throw new common_1.ForbiddenException('Access Denied');
        const tokens = await this.generateTokens(user.id, user.email);
        await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
        return tokens;
    }
    async generateArgonHash(data) {
        return await argon2.hash(data);
    }
    async updateRefreshTokenHash(userId, refreshToken) {
        const hash = await this.generateArgonHash(refreshToken);
        await User_1.User.update({ refreshToken: hash }, {
            where: { id: userId }
        });
    }
    async generateTokens(userId, email) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync({
                sub: userId,
                email,
            }, {
                secret: this.config.get('JWT_ACCESS_TOKEN_SECRET_KEY'),
                expiresIn: this.config.get('ACCESS_TOKEN_LIFE_TIME') * 60,
            }),
            this.jwtService.signAsync({
                sub: userId,
                email,
            }, {
                secret: this.config.get('JWT_REFRESH_TOKEN_SECRET_KEY'),
                expiresIn: this.config.get('REFRESH_TOKEN_LIFE_TIME') * 24 * 60 * 60,
            }),
        ]);
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map