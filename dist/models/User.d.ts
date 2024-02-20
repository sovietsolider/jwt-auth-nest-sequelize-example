import { Model } from "sequelize-typescript";
export declare class User extends Model {
    name: string;
    phone: string;
    email: string;
    password: string;
    refreshToken: string;
}
