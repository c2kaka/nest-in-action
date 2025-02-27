import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject(JwtService)
  private readonly jwtService: JwtService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // check if the token is valid
    const request = context.switchToHttp().getRequest();

    // JWT token is not used in this example
    // const authorization = request.headers.authorization || '';
    // const authorizationParts = authorization.split(' ');
    // if (!authorizationParts || authorizationParts.length !== 2) {
    //   throw new UnauthorizedException('Invalid token');
    // }
    //
    // try {
    //   const info = this.jwtService.verify(authorizationParts[1]);
    //   request.user = info.user;
    //   return true;
    // } catch (e) {
    //   throw new UnauthorizedException('Token expired, please login again');
    // }

    // session is used in this example
    console.log('[loginGuard]request.session', request.session.user);
    if (!request.session?.user) {
      throw new UnauthorizedException('Please login first');
    }

    return true;
  }
}
