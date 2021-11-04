import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { hasRoles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '../models/role.enum';
import { User } from '../models/user.entity';
import { UserService } from '../services/users.service';

@hasRoles(Role.ADMIN)
@UseGuards(AuthGuard(), RolesGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  getAllUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }

  @Get('/:id')
  getUserById(@Param('id') id: string): Promise<User> {
    return this.userService.getUserById(id);
  }
}
