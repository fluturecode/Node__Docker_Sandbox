import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class AgencyCreationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  agencyName: string;
}