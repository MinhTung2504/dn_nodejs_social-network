import {
  IsEmail,
  IsEnum,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  DEFAULT_MAX_LENGTH,
  DEFAULT_MIN_LENGTH,
  REG_EXP,
} from 'src/utils/constants';
import { GenderType } from '../models/gender.enum';

export class AuthCredentialsDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  @MaxLength(DEFAULT_MAX_LENGTH)
  readonly firstname: string;

  @IsString()
  @MaxLength(DEFAULT_MAX_LENGTH)
  readonly lastname: string;

  @IsEnum(GenderType)
  readonly gender: GenderType;

  @IsString()
  @MinLength(DEFAULT_MIN_LENGTH)
  @MaxLength(DEFAULT_MAX_LENGTH)
  @Matches(REG_EXP, {
    message: `password must contain at least 1 upper case letter, 1 lower case letter and 1 number or special character`,
  })
  readonly password: string;
}
