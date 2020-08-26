import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class AgentAddressDto {
  @ApiProperty()
  @IsString()
  address1: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address2: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsString()
  zipCode: string;
}