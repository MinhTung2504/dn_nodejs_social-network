import { SetMetadata } from '@nestjs/common';
import { Role } from '../models/role.enum';

export const hasRoles = (...hasRoles: Role[]) => SetMetadata('roles', hasRoles);
