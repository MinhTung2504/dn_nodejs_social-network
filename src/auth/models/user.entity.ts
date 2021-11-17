import { PostSocial } from 'src/posts/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FriendFollowEntity } from './friend-follow.entity';
import { FriendRequestEntity } from './friend-request.entity';
import { GenderType } from './gender.enum';
import { Role } from './role.enum';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({ type: 'enum', enum: GenderType })
  gender: GenderType;

  @Column({ unique: true })
  email: string;

  @Column({ default: null })
  avatar: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt: Date;

  @OneToMany(() => PostSocial, (post) => post.user, { eager: true })
  posts: PostSocial[];

  @OneToMany(
    () => FriendRequestEntity,
    (friendRequestsEntity) => friendRequestsEntity.creator,
    { eager: true },
  )
  sentFriendRequests: FriendRequestEntity[];

  @OneToMany(
    () => FriendRequestEntity,
    (friendRequestsEntity) => friendRequestsEntity.receiver,
    { eager: true },
  )
  receivedFriendRequests: FriendRequestEntity[];

  @OneToMany(
    () => FriendFollowEntity,
    (friendFollowEntity) => friendFollowEntity.follower,
    { eager: true },
  )
  followFriends: FriendFollowEntity[];

  @OneToMany(
    () => FriendFollowEntity,
    (friendFollowEntity) => friendFollowEntity.followee,
    { eager: true },
  )
  receivedFollows: FriendFollowEntity[];
}
