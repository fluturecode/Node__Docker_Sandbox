import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';
import { UserSignupDto } from '../../auth/dto/user-signup.dto';

import * as bcrypt from 'bcrypt';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  public async comparePassword(password: string, userPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, userPassword);
  }

  public generateSalt(): Promise<string> {
    return bcrypt.genSalt(10);
  }

  public async findUserByEmail(email: string): Promise<User> {
    return await this.findOne({ email: email.toLowerCase() });
  }

  public async hashPassword(password: string): Promise<string> {
    const salt: string = await this.generateSalt(),
      passwordHash: string = await bcrypt.hash(password, salt);

    return passwordHash;
  }

  public async signUp(userData: UserSignupDto): Promise<User> {
    const user: User = this.create();

    userData.password = await this.hashPassword(userData.password);

    Object.assign(user, userData);

    return user.save();
  }
}