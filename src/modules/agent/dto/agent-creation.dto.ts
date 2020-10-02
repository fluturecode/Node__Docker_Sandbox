import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsEmail, IsPhoneNumber, IsOptional, ValidateNested } from "class-validator";
import { AgentAddressDto } from "./agent-address.dto";
import { Type } from "class-transformer";

export class AgentCreationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsPhoneNumber('US')
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  thumbnail: string;

  @ApiProperty()
  @IsOptional()
  @Type(() => AgentAddressDto)
  @ValidateNested()
  address: AgentAddressDto;
}