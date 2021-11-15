import { GenderType } from '../models/gender.enum';

export class UpdateProfileDto {
  readonly firstname: string;
  readonly lastname: string;
  readonly gender: GenderType;
}
