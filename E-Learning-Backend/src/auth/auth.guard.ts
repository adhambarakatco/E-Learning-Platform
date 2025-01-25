import { Injectable, ExecutionContext, UnauthorizedException,CanActivate,Logger} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { LogsService } from '../logging/logs.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../auth/public.decorator';
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
    constructor(private jwtService: JwtService,private reflector: Reflector ) {}


    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
          ]);
          if (isPublic) {
            return true;
          }
        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);
        if (!token) {
            this.logger.log("no token")
            throw new UnauthorizedException('No token, please login');

        }
        try {
            const payload = await this.jwtService.verifyAsync(token['accessToken']);
            request['user'] = payload;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
        return true;
    }

    private extractToken(request: Request): string | undefined {
      const token = request.cookies?.jwt || request.headers['authorization']?.split(' ')[1];

      return token;
  }
}