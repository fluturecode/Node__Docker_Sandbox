import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';
import { UserSignupDto } from '../../user/dto/user-signup.dto';

import * as bcrypt from 'bcrypt';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  userKeysToDelete: string[] = [
    'password',
    'session_salt'
  ];

  public async comparePassword(password: string, userPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, userPassword);
  }

  public async createSession(user: User): Promise<User> {
    user.session_salt = await this.generateSalt();

    return user.save();
  }

  public async destroySession(user: User): Promise<User> {
    user.session_salt = null;

    return await user.save();
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

  public removeSensativeKeys(user: User): Partial<User> {
    this.userKeysToDelete.forEach((key: string) => delete user[key]);

    return user;
  }

  public async signUp(userData: UserSignupDto): Promise<Partial<User>> {
    const user: User = this.create();

    userData.password = await this.hashPassword(userData.password);

    Object.assign(user, userData);

    const savedUser: User = await user.save();

    return this.removeSensativeKeys(savedUser);
  }
}