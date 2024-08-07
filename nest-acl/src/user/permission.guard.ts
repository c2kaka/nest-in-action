import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject(UserService)
  private readonly userService: UserService;

  @Inject(Reflector)
  private readonly reflector: Reflector;

  @Inject(RedisService)
  private readonly redisService: RedisService;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.session?.user;

    if (!user) {
      throw new UnauthorizedException('Please login first');
    }

    let permissions = (await this.redisService.listGet(
      `user_${user.username}_permissions`,
    )) as string[];

    if (permissions.length === 0) {
      const foundUser = (await this.userService.findPermissionsByUsername(
        user.username,
      )) as any;

      permissions = foundUser.permissions.map((p) => p.name);
      this.redisService.listSet(
        `user_${user.username}_permissions`,
        permissions,
        60 * 60,
      );
    }

    const permission = this.reflector.get('permission', context.getHandler());
    if (permissions.some((p) => p === permission)) {
      return true;
    } else {
      throw new UnauthorizedException('You do not have permission');
    }

    return true;
  }
}
