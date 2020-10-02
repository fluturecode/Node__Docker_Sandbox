import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsEmail, IsPhoneNumber, IsOptional, ValidateNested } from "class-validator";
import { AgentAddressDto } from "./agent-address.dto";
import { Type } from "class-transformer";

export class AgentUpdateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsPhoneNumber('US')
  @IsNotEmpty()
  @IsOptional()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  thumbnail: string;

  @ApiProperty()
  @IsOptional()
  @IsOptional()
  @Type(() => AgentAddressDto)
  @ValidateNested()
  address: AgentAddressDto;
}