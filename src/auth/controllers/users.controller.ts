import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { hasRoles } from '../decorators/roles.decorator';
import { GetProfilesFilterDto } from '../dtos/get-profiles-filter.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { RolesGuard } from '../guards/roles.guard';
import {
  FriendFollow,
  FriendFollowStatus,
} from '../models/friend-follow.interface';
import {
  FriendRequest,
  FriendRequestStatus,
} from '../models/friend-request.interface';
import { Role } from '../models/role.enum';
import { User } from '../models/user.entity';
import { UserService } from '../services/users.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @hasRoles(Role.ADMIN)
  @UseGuards(AuthGuard(), RolesGuard)
  @Get()
  getAllUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }

  @hasRoles(Role.ADMIN, Role.USER)
  @UseGuards(AuthGuard(), RolesGuard)
  @Get('/profile')
  findOthersProfiles(@Query() profileFilter: GetProfilesFilterDto) {
    return this.userService.findOthersProfiles(profileFilter);
  }

  @hasRoles(Role.ADMIN, Role.USER)
  @UseGuards(AuthGuard(), RolesGuard)
  @Put('/profile')
  async updateProfile(
    @Request() req,
    @Body() updateProfile: UpdateProfileDto,
  ): Promise<User> {
    return await this.userService.updateProfile(req.user, updateProfile);
  }

  @hasRoles(Role.ADMIN, Role.USER)
  @UseGuards(AuthGuard(), RolesGuard)
  @Get('/:id')
  getUserById(@Param('id') id: number): Promise<Observable<User>> {
    return this.userService.getUserById(id);
  }

  @hasRoles(Role.ADMIN, Role.USER)
  @UseGuards(AuthGuard(), RolesGuard)
  @Post('friend-request/send/:receiverId')
  async sendFriendRequest(
    @Param('receiverId', ParseIntPipe) receiverId: number,
    @Request() req,
  ): Promise<Observable<FriendRequest | { error: string }>> {
    return await this.userService.sendFriendRequest(receiverId, req.user);
  }

  @hasRoles(Role.ADMIN, Role.USER)
  @UseGuards(AuthGuard(), RolesGuard)
  @Get('friend-request/status/:receiverId')
  getFriendRequestStatus(
    @Param('receiverId', ParseIntPipe) receiverId: number,
    @Request() req,
  ): Promise<Observable<FriendRequestStatus>> {
    return this.userService.getFriendRequestStatus(receiverId, req.user);
  }

  @hasRoles(Role.ADMIN, Role.USER)
  @UseGuards(AuthGuard(), RolesGuard)
  @Put('friend-request/response/:friendRequestId')
  respondToFriendRequest(
    @Param('friendRequestId', ParseIntPipe) friendRequestId: number,
    @Body() statusResponse: FriendRequestStatus,
  ): Observable<FriendRequestStatus> {
    return this.userService.respondToFriendRequest(
      statusResponse.status,
      friendRequestId,
    );
  }

  @hasRoles(Role.ADMIN, Role.USER)
  @UseGuards(AuthGuard(), RolesGuard)
  @Get('friend-request/me/received-requests')
  getFriendRequestsFromRecipients(
    @Request() req,
  ): Observable<FriendRequestStatus[]> {
    return this.userService.getFriendRequestsFromRecipients(req.user);
  }

  @hasRoles(Role.ADMIN, Role.USER)
  @UseGuards(AuthGuard(), RolesGuard)
  @Post('friend-follow/follow/:followId')
  async followFriend(
    @Param('followId', ParseIntPipe) followId: number,
    @Request() req,
  ): Promise<Observable<FriendFollow | { error: string }>> {
    return await this.userService.followFriend(followId, req.user);
  }

  @hasRoles(Role.ADMIN, Role.USER)
  @UseGuards(AuthGuard(), RolesGuard)
  @Put('friend-follow/follow/:followId')
  respondFollowing(
    @Param('followId', ParseIntPipe) followId: number,
    @Body() statusResponse: FriendFollowStatus,
  ): Observable<FriendFollowStatus> {
    return this.userService.respondFollowing(statusResponse.status, followId);
  }
}
