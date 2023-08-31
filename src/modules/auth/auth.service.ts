import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from '../users/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string) {
    // Find if a user with this email exists
    const user = await this.userService.findOneByEmail(username);

    if (!user) return null;

    // Find if user's password matches
    const match = await this.comparePassword(pass, user.password);

    if (!match) return null;

    // tslint:disable-next-line: no-string-literal
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user['dataValues'];
    return result;
  }

  public async login(user: string) {
    const token = await this.generateToken(user);
    return { user, token };
  }

  public async create(user: UserDto) {
    // Hash the password
    const pass = await this.hashPassword(user.password);

    // Create the user
    const newUser = await this.userService.create({ ...user, password: pass });

    // tslint:disable-next-line: no-string-literal
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = newUser['dataValues'];

    // Generate token
    const token = await this.generateToken(result);

    // Return the user and the token
    return { user: result, token };
  }

  private async generateToken(user) {
    const token = await this.jwtService.signAsync(user);
    return token;
  }

  private async hashPassword(password: string) {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  private async comparePassword(enteredPassword: string, dbPassword: string) {
    const match = await bcrypt.compare(enteredPassword, dbPassword);
    return match;
  }
}
