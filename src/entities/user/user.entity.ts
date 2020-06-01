import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: false})
  email: string;

  @Column({nullable: false})
  password: string;

  @Column({nullable: true})
  session_salt: string;

  @Column({nullable: false})
  first_name: string;

  @Column({nullable: false})
  last_name: string;
}