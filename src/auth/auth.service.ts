import { Injectable } from '@nestjs/common';
import { User } from 'src/models/User';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(email: string, pass: string): Promise<User> {
    const user = await User.findOne({where: {email}});
    console.log(user.name)
    if (user && user.password === pass) {
      //const { password, ...result } = user;
      return user;
    }
    return null;
  }

  async login(user: User) {
    // console.log('via login')
    // console.log(user.name)
    const payload = { username: user.name, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

    
}