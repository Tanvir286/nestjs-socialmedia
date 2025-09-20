import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import appConfig from 'src/config/app.config';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor() {

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
      //ignoreExpiration: false,
      secretOrKey: appConfig().jwt.secret, 
    });
  }

  // Payload থেকে user id extract করতে হবে
  async validate(payload: any) {
    return { id: payload.id, email: payload.email };
  }
}
