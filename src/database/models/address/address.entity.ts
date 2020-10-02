import { Entity, Column, ManyToOne, OneToOne } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

import { Agent, Agency, S3BaseEntity } from "@models";

@Entity()
export class Address extends S3BaseEntity {
  @ApiProperty()
  @Column({ nullable: false })
  address1: string;

  @ApiProperty()
  @Column({ nullable: true })
  address2: string;

  @ApiProperty()
  @Column({ nullable: false })
  city: string;

  @ApiProperty()
  @Column({ nullable: false })
  state: string;

  @ApiProperty()
  @Column({ nullable: false })
  zipCode: string;

  @ApiProperty({ type: () => Agent })
  @OneToOne(type => Agent, agent => agent.address, { nullable: false })
  agent: Agent;

  @ApiProperty({ type: () => Agency })
  @ManyToOne(type => Agency, { eager: true, nullable: false })
  agency: Agency;
}