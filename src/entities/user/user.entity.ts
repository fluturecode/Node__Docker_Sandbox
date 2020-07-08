import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, Unique, Index } from 'typeorm';
import { EmailUtility } from '@utilities/email/email.utility';
import { JwtUtility } from '@utilities/jwt/jwt.utility';
import { Exclude } from 'class-transformer';

import environment from '@environment';

import * as bcrypt from 'bcrypt';

import { ApiProperty } from '@nestjs/swagger';

@Index(['email', 'sessionSalt'])
@Unique(['email'])
@Entity()
export class User extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ApiProperty()
  @Column({nullable: false})
  email: string;

  @Exclude({ toPlainOnly: true })
  @Column({nullable: true})
  password: string;

  @Exclude({ toPlainOnly: true })
  @Column({nullable: true})
  sessionSalt: string;

  @Exclude({ toPlainOnly: true })
  @Column({nullable: true})
  temporaryTokenHash: string;

  @ApiProperty()
  @Column({nullable: false})
  firstName: string;

  @ApiProperty()
  @Column({nullable: false})
  lastName: string;

  @ApiProperty()
  @Column({nullable: true})
  profilePicture: string;

  @ApiProperty()
  @Column({nullable: true})
  activatedAt: Date;

  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public async hashPassword(password: string): Promise<string> {
    const salt: string = await bcrypt.genSalt(10),
      passwordHash: string = await bcrypt.hash(password.toString(), salt);

    this.password = passwordHash;

    return passwordHash;
  }

  public async sendWelcomeEmail(): Promise<void> {
    const emailUtility: EmailUtility = new EmailUtility(),
      jwtUtility: JwtUtility = new JwtUtility(),
      tokenHash: string = await bcrypt.genSalt(10);

    jwtUtility.changeJwtOptions({
      secret: tokenHash,
      signOptions: {
        expiresIn: '1h'
      }
    });

    this.temporaryTokenHash = tokenHash;

    await this.save();

    const resetToken: string = jwtUtility.sign({ id: this.id, email: this.email });

    await emailUtility.sendSingleEmail({
      subject: `Welcome to ${environment.application_name}!`,
      to: this.email,
      template: 'user-welcome',
      templateVariables: {
        applicationName: environment.application_name,
        activationUrl: `${environment.client_url}/user/activate-account/${resetToken}`,
        user: this.getFullName()
      }
    });
  }
}