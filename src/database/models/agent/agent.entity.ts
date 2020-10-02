import { Entity, Column, ManyToOne, OneToOne, JoinColumn, Unique } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

import { Address, Agency, S3BaseEntity } from "@models";

@Unique(["email"])
@Entity()
export class Agent extends S3BaseEntity {
  @ApiProperty()
  @Column({ nullable: false })
  description: string;

  @ApiProperty()
  @Column({ nullable: false })
  email: string;

  @ApiProperty()
  @Column({ nullable: false })
  name: string;

  @ApiProperty()
  @Column({ nullable: false })
  phoneNumber: string;

  @ApiProperty()
  @Column({ nullable: false })
  thumbnail: string;

  @ApiProperty({ type: () => Address })
  @OneToOne('Address', { eager: true, nullable: true })
  @JoinColumn()
  address: Address;

  @ApiProperty({ type: () => Agency })
  @ManyToOne('Agency', { eager: true, nullable: false })
  agency: Agency;
}