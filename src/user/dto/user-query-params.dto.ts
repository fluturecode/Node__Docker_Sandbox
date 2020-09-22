import { Type } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";

export class UserQueryParamsDto {
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  agencyId: number;
}