
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';



@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers['authorization'];

     const token = authHeader.split(' ')[1];

     if (!token) {
      throw new UnauthorizedException();
    }

    try{
        const decoded = await this.jwtService.verifyAsync(token);
        
    }catch{}

    await this.jwtService.verifyAsync(token);
    return true;
  }
}
