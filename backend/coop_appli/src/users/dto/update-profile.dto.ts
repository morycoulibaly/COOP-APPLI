import { IsString, IsNotEmpty } from "class-validator";

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  telephone: string;
}