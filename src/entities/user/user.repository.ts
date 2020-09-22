import { EntityRepository, Repository, IsNull, Not } from 'typeorm';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

import { EmailUtility } from '@utilities/email/email.utility';
import { JwtUtility } from '@utilities/jwt/jwt.utility';

import { Agency, Role, User } from '@entities';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { UserCreationDto, UserQueryParamsDto, UserSignupDto } from '../../user/dto';

import environment from '@environment';

import * as bcrypt from 'bcrypt';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  emailUtility: EmailUtility = new EmailUtility();

  public async createUser(userData: UserSignupDto | UserCreationDto, role: Role, agency: Agency): Promise<User> {
    await this.checkForDuplicateUserByEmail(userData.email);

    Object.assign(
      userData,
      {
        agency,
        role
      }
    );

    const newUser: User = await this.create(userData).save();

    await newUser.sendWelcomeEmail();

    return newUser;
  }

  public async checkForDuplicateUserByEmail(email: string): Promise<void> {
    const duplicateUser: User = await this.findUserByEmail(email);

    if (duplicateUser) {
      throw new BadRequestException(`A user with email: ${email} already exists.`);
    }
  }

  public async comparePassword(password: string, userPassword: string): Promise<boolean> {
    return await bcrypt.compare(password.toString(), userPassword);
  }

  public async createSession(user: User): Promise<User> {
    user.sessionSalt = await bcrypt.genSalt(10);

    return user.save();
  }

  public async destroySession(user: User): Promise<User> {
    user.sessionSalt = null;

    return await user.save();
  }

  public findAllUsers(currentUser: User, queryParams: UserQueryParamsDto): Promise<User[]> {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('role.id = user.role')
      .leftJoinAndSelect('user.agency', 'agency')
      .where('agency.id = user.agency')
      .andWhere('role.roleName IN (:...roleNames)', { roleNames: currentUser.role.allowedUserRoles })
      .andWhere('agency.id = :agencyId', { agencyId: queryParams.agencyId || currentUser.agency.id })
      .orderBy({
        'user.lastName': 'ASC',
        'user.id': 'DESC'
      })
      .getMany();
  }

  public async findUserByJwtPayload(jwtPayload: JwtPayload): Promise<User> {
    return await this.findOne({ id: jwtPayload.id, email: jwtPayload.email.toLowerCase() });
  }

  public async findActivatedUserByEmail(email: string): Promise<User> {
    return await this.findOne({ email: email.toLowerCase(), activatedAt: Not(IsNull()) });
  }

  public async findUserByEmail(email: string): Promise<User> {
    return await this.findOne({ email: email.toString().toLowerCase() });
  }

  public async findUserById(id: number, currentUser: User): Promise<User> {
    return this.findOne({ id, agency: currentUser.agency });
  }

  public async sendResetPasswordEmail(email: string): Promise<void> {
    const user: User = await this.findUserByEmail(email),
      jwtUtility: JwtUtility = new JwtUtility();

    if (!user) {
      // TODO: Log attempt at password reset
      return;
    }

    const tokenHash: string = await bcrypt.genSalt(10);

    jwtUtility.changeJwtOptions({
      secret: tokenHash,
      signOptions: {
        expiresIn: '1h'
      }
    });

    user.temporaryTokenHash = tokenHash;

    await user.save();

    const resetToken: string = jwtUtility.sign({ id: user.id, email: user.email });

    await this.emailUtility.sendSingleEmail({
      subject: 'Forgotten Password',
      to: user.email,
      template: 'forgot-password',
      templateVariables: {
        applicationName: environment.application_name,
        resetUrl: `${environment.client_url}/auth/reset-password/${resetToken}`,
        user: user.getFullName()
      }
    });
  }

  public async setPassword(user: User, password: string): Promise<User> {
    try {
      await user.hashPassword(password);

      Object.assign(
        user,
        {
          temporaryTokenHash: null,
          sessionSalt: null
        }
      );

      const updatedUser: User = await user.save();

      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}