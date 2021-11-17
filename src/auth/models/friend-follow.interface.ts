import { User } from './user.entity';
export type Follow_Status = 'following' | 'unfollowing';

export interface FriendFollowStatus {
  status?: Follow_Status;
}
export interface FriendFollow {
  id?: number;
  follower?: User;
  followee?: User;
  status?: Follow_Status;
}
