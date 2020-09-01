import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class AgencyUpdateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  agencyName: string;
}