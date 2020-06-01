import { User } from '../../entities/user/user.entity';

export interface JwtResponse {
  jwt_token: string;
  user: User;
}