import { EntityRepository, Repository } from 'typeorm';
import { UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtUtility } from '@utilities/jwt/jwt.utility';

import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

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

  public removeSensitiveKeys(user: User): Partial<User> {
    this.userKeysToDelete.forEach((key: string) => delete user[key]);

    return user;
  }

  public async sendResetPasswordEmail(email: string): Promise<void> {
    const user: User = await this.findUserByEmail(email),
      jwtUtility: JwtUtility = new JwtUtility();

    if (!user) {
      // TODO: Log attempt at password reset
      return;
    }

    const resetHash: string = await this.generateSalt();

    jwtUtility.changeJwtOptions({
      secret: resetHash,
      signOptions: {
        expiresIn: '1h'
      }
    });

    user.password_reset_hash = resetHash;

    await user.save();

    const resetToken: string = jwtUtility.sign({ id: user.id, email: user.email });

    // TODO: Actually send the reset email when email utility is done
  }

  public async validateTokenAndResetPassword(token: string, newPassword: string): Promise<User> {
    const jwtUtility: JwtUtility = new JwtUtility(),
      jwtPayload: JwtPayload = jwtUtility.decodeJwtToken<JwtPayload>(token),
      unauthorizedError: UnauthorizedException = new UnauthorizedException('Invalid or expired token');

    if (!jwtPayload.id || !jwtPayload.email) {
      throw unauthorizedError;
    }

    const user = await this.findOne({ id: jwtPayload.id, email: jwtPayload.email.toLowerCase() });

    if (user) {
      jwtUtility.changeJwtOptions({
        secret: user.password_reset_hash
      });

      try {
        jwtUtility.verifyToken(token);
      } catch (error) {
        throw unauthorizedError;
      }

      try {
        Object.assign(
          user,
          {
            password: await this.hashPassword(newPassword),
            password_reset_hash: null,
            session_salt: null
          }
        );

        return await user.save();
      } catch (error) {
        throw new InternalServerErrorException(error);
      }
    }

    throw unauthorizedError;
  }

  public async signUp(userData: UserSignupDto): Promise<Partial<User>> {
    const user: User = this.create();

    userData.password = await this.hashPassword(userData.password);

    Object.assign(user, userData);

    const savedUser: User = await user.save();

    return this.removeSensitiveKeys(savedUser);
  }
}