import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, map, Observable, of, switchMap } from 'rxjs';
import {
  user_cannot_resend_friend_request,
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
import { RequestStatus } from '../models/request-status.enum';
import { User } from '../models/user.entity';
import stringInject from 'stringinject';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(FriendRequestEntity)
    private friendRequestRepository: Repository<FriendRequestEntity>,
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
}
