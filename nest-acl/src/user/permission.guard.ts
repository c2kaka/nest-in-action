import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject(UserService)
  private readonly userService: UserService;

  @Inject(Reflector)
  private readonly reflector: Reflector;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.session?.user;

    console.log('[permissionGuard]request.session', request.session);

    if (!user) {
      throw new UnauthorizedException('Please login first');
    }

    const foundUser = (await this.userService.findPermissionsByUsername(
      user.username,
    )) as any;
    console.log('foundUser', foundUser);

    const permission = this.reflector.get('permission', context.getHandler());
    if (foundUser.permissions.some((p) => p.name === permission)) {
      return true;
    } else {
      throw new UnauthorizedException('You do not have permission');
    }

    return true;
  }
}
