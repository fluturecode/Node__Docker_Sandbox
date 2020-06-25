import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, Unique, Index, BeforeInsert } from 'typeorm';

@Index(['email', 'session_salt'])
@Unique(['email'])
@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({nullable: false})
  email: string;

  @Column({nullable: false})
  password: string;

  @Index()
  @Column({nullable: true})
  session_salt: string;

  @Index()
  @Column({nullable: true})
  password_reset_hash: string;

  @Column({nullable: false})
  first_name: string;

  @Column({nullable: false})
  last_name: string;

  getFullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }
}