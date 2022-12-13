import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../../user/user.service';
import { User } from '../../../user/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private jwtTokenService: JwtService,
  ) {}

  // async validateUser(usernameOrEmail: string, password: string): Promise<any> {
  //   console.log(usernameOrEmail);
  //   const user = await this.userService.findUserByEmailOrUsername(
  //     usernameOrEmail,
  //   );
  //   console.log(user);
  //   if (user) {
  //     if (await bcrypt.compare(password, user.password)) {
  //       delete user.password;
  //       return user;
  //     }
  //   }
  //   return null;
  // }

  async verifyPassword({
    password,
    candidatePassword,
  }: {
    password: string;
    candidatePassword: string;
  }) {
    return await bcrypt.compare(candidatePassword, password);
  }

  async generateUserCredentials(user: User) {
    return this.jwtTokenService.sign(user);
  }
}
