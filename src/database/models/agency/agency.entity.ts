import { Index, Column, Entity, Unique } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { S3BaseEntity } from "@models";

@Unique(['agencyName'])
@Entity()
export class Agency extends S3BaseEntity {
  @Index()
  @ApiProperty()
  @Column({nullable: false})
  agencyName: string;
}