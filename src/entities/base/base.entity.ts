import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

export class S3BaseEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  readonly id: number;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @ManyToOne('User')
  createdBy: Number;

  @ApiProperty()
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @ApiProperty()
  @ManyToOne('User')
  deletedBy: Number;

  @ApiProperty()
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