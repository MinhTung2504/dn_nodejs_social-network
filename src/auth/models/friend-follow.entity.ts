import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Follow_Status } from './friend-follow.interface';
import { User } from './user.entity';

@Entity('follow')
export class FriendFollowEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.followFriends)
  follower: User;

  @ManyToOne(() => User, (user) => user.receivedFollows)
  followee: User;

  @Column()
  status: Follow_Status;
}
