import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '@entities';

export class S3BaseEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Exclude({ toPlainOnly: true })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @ManyToOne(type => User)
  createdBy: Number;

  @ApiProperty()
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @ApiProperty()
  @ManyToOne(type => User)
  deletedBy: Number;

  @Exclude({ toPlainOnly: true })
  @UpdateDateColumn()
  updatedAt: Date;

  public setCreatedBy(userId: number): void {
    this.createdBy = userId;
  }

  public softDelete(userId: number): void {
    this.deletedAt = new Date();
    this.deletedBy = userId;
  }
}