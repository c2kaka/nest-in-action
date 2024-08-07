import {
  Body,
  Controller,
  Inject,
  Post,
  Session,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('user')
export class UserController {
  @Inject(JwtService)
  private readonly jwtService: JwtService;

  constructor(private readonly userService: UserService) {}

  @Post('initPermissions')
  async initPermissions() {
    await this.userService.initPermissions();
    return '初始化权限成功';
  }

  @Post('login')
  async login(
    @Body(ValidationPipe) user: LoginDto,
    // @Res({ passthrough: true }) response: Response,
    @Session() session: Record<string, any>,
  ) {
    const existingUser = await this.userService.login(user);

    if (!existingUser) {
      return 'Login failed';
    } else {
      // const payload = { username: existingUser.username, sub: existingUser.id };
      // const token = this.jwtService.sign(payload);
      // response.setHeader('token', token);

      // set cookie
      session.user = {
        username: existingUser.username,
      };

      return 'Login successful';
    }
  }

  @Post('register')
  async register(@Body(ValidationPipe) user: RegisterDto) {
    return await this.userService.register(user);
  }
}
