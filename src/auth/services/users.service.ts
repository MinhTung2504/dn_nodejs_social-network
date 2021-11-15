import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, map, Observable, of, switchMap } from 'rxjs';
import {
  user_cannot_refollow_friend_request,
  user_cannot_resend_friend_request,
  user_cannot_seflfollow,
  user_cannot_seflsend_friend_request,
  user_id_not_found,
} from 'src/utils/messages';
import { Repository } from 'typeorm/repository/Repository';
import { FriendRequestEntity } from '../models/friend-request.entity';
import {
  FriendRequest,
  FriendRequestStatus,
  FriendRequest_Status,
} from '../models/friend-request.interface';
import { FollowStatus, RequestStatus } from '../models/request-status.enum';
import { User } from '../models/user.entity';
import stringInject from 'stringinject';
import { GetProfilesFilterDto } from '../dtos/get-profiles-filter.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import {
  Follow_Status,
  FriendFollow,
  FriendFollowStatus,
} from '../models/friend-follow.interface';
import { FriendFollowEntity } from '../models/friend-follow.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(FriendRequestEntity)
    private friendRequestRepository: Repository<FriendRequestEntity>,

    @InjectRepository(FriendFollowEntity)
    private friendFollowRepository: Repository<FriendFollowEntity>,
  ) {}
  async getUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async getUserById(id: number): Promise<Observable<User>> {
    return from(this.userRepository.findOne({ id })).pipe(
      map((user: User) => {
        if (!user) {
          throw new HttpException(
            stringInject(user_id_not_found, [id]),
            HttpStatus.NOT_FOUND,
          );
        }
        delete user.password;
        return user;
      }),
    );
  }

  hasRequestBeenSentOrReceived(
    creator: User,
    receiver: User,
  ): Observable<boolean> {
    return from(
      this.friendRequestRepository.findOne({
        where: [
          { creator, receiver },
          { creator: receiver, receiver: creator },
        ],
      }),
    ).pipe(
      switchMap((friendRequest: FriendRequest) => {
        if (!friendRequest) return of(false);
        return of(true);
      }),
    );
  }

  async sendFriendRequest(
    receiverId: number,
    creator: User,
  ): Promise<Observable<FriendRequest | { error: string }>> {
    if (receiverId === creator.id)
      return of({ error: user_cannot_seflsend_friend_request });

    return (await this.getUserById(receiverId)).pipe(
      switchMap((receiver: User) => {
        return this.hasRequestBeenSentOrReceived(creator, receiver).pipe(
          switchMap((hasRequestBeenSentOrReceived: boolean) => {
            if (hasRequestBeenSentOrReceived)
              return of({
                error: user_cannot_resend_friend_request,
              });

            const friendRequest: FriendRequest = {
              creator,
              receiver,
              status: RequestStatus.PENDING,
            };
            return from(this.friendRequestRepository.save(friendRequest));
          }),
        );
      }),
    );
  }

  async getFriendRequestStatus(
    receiverId: number,
    currentUser: User,
  ): Promise<Observable<FriendRequestStatus>> {
    return (await this.getUserById(receiverId)).pipe(
      switchMap((receiver: User) => {
        return from(
          this.friendRequestRepository.findOne({
            creator: currentUser,
            receiver,
          }),
        );
      }),
      switchMap((friendRequest: FriendRequest) => {
        return of({ status: friendRequest.status });
      }),
    );
  }

  getFriendRequestUserById(friendRequestId: number): Observable<FriendRequest> {
    return from(
      this.friendRequestRepository.findOne({
        where: [{ id: friendRequestId }],
      }),
    );
  }

  respondToFriendRequest(
    statusResponse: FriendRequest_Status,
    friendRequestId: number,
  ): Observable<FriendRequestStatus> {
    return this.getFriendRequestUserById(friendRequestId).pipe(
      switchMap((friendRequest: FriendRequest) => {
        return from(
          this.friendRequestRepository.save({
            ...friendRequest,
            status: statusResponse,
          }),
        );
      }),
    );
  }

  getFriendRequestsFromRecipients(
    currentUser: User,
  ): Observable<FriendRequest[]> {
    return from(
      this.friendRequestRepository.find({
        where: [{ receiver: currentUser }],
      }),
    );
  }

  async findOthersProfiles(profileFilter: GetProfilesFilterDto) {
    const { search } = profileFilter;

    const query = this.userRepository.createQueryBuilder('user');

    if (search) {
      query.where(
        '(LOWER(user.firstname) LIKE LOWER(:search) OR LOWER(user.lastname) LIKE LOWER(:search))',
        {
          search: `%${search}%`,
        },
      );
    }

    const profiles = await query.getMany();
    return profiles;
  }

  async findUserByID(id): Promise<User> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new HttpException(
        stringInject(user_id_not_found, [id]),
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  async updateProfile(
    user: User,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const profile = await this.findUserByID(user.id);

    const { firstname, lastname, gender } = updateProfileDto;

    profile.firstname = firstname;
    profile.lastname = lastname;
    profile.gender = gender;

    await this.userRepository.save(profile);
    return profile;
  }

  hasFollowReceived(follower: User, followee: User): Observable<boolean> {
    return from(
      this.friendFollowRepository.findOne({
        where: [
          { follower, followee },
          { follower: followee, followee: follower },
        ],
      }),
    ).pipe(
      switchMap((friendFollow: FriendFollow) => {
        if (!friendFollow) return of(false);
        return of(true);
      }),
    );
  }

  async followFriend(
    receiverId: number,
    follower: User,
  ): Promise<Observable<FriendFollow | { error: string }>> {
    if (receiverId === follower.id)
      return of({ error: user_cannot_seflfollow });

    return (await this.getUserById(receiverId)).pipe(
      switchMap((followee: User) => {
        return this.hasFollowReceived(follower, followee).pipe(
          switchMap((hasFollowReceived: boolean) => {
            if (hasFollowReceived)
              return of({
                error: user_cannot_refollow_friend_request,
              });

            const friendFollow: FriendFollow = {
              follower,
              followee,
              status: FollowStatus.FOLLOWING,
            };
            return from(this.friendFollowRepository.save(friendFollow));
          }),
        );
      }),
    );
  }

  getFriendFollowUserById(friendFollowId: number): Observable<FriendFollow> {
    return from(
      this.friendFollowRepository.findOne({
        where: [{ id: friendFollowId }],
      }),
    );
  }

  respondFollowing(
    statusResponse: Follow_Status,
    followId: number,
  ): Observable<FriendFollowStatus> {
    return this.getFriendFollowUserById(followId).pipe(
      switchMap((friendfollow: FriendFollow) => {
        return from(
          this.friendFollowRepository.save({
            ...friendfollow,
            status: statusResponse,
          }),
        );
      }),
    );
  }
}
