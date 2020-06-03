import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../entities/user/user.respository';
import { UserSignupDto } from './dto/user-signup.dto';
import { User } from '../entities/user/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private userRespository: UserRepository
  ) {}

  signUp(signupDto: UserSignupDto): Promise<Partial<User>> {
    return this.userRespository.signUp(signupDto);
  }
}
