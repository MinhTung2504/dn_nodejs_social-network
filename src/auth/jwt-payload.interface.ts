import { GenderType } from './models/gender.enum';
import { Role } from './models/role.enum';

export interface JwtPayload {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  gender: GenderType;
  role: Role;
}
