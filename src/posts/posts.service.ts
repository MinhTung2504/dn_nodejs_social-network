import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/models/user.entity';
import { ActionPostDto } from './dtos/action-post.dto';
import { GetPostsFilterDto } from './dtos/get-posts-filter.dto';
import { PostSocial } from './post.entity';
import { PostsRepository } from './posts.repository';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsRepository)
    private postsRepository: PostsRepository,
  ) {}

  public createPost(
    createPostDto: ActionPostDto,
    user: User,
  ): Promise<PostSocial> {
    return this.postsRepository.createPost(createPostDto, user);
  }

  public getPosts(
    filterDto: GetPostsFilterDto,
    user: User,
  ): Promise<PostSocial[]> {
    return this.postsRepository.getPosts(filterDto, user);
  }

  public async getPostById(id: string, user: User): Promise<PostSocial> {
    return this.postsRepository.getPostById(id, user);
  }

  public async deletePost(id: string, user: User): Promise<string> {
    return this.postsRepository.deletePost(id, user);
  }

  public async updatePost(
    id: string,
    updatePostDto: ActionPostDto,
    user: User,
  ): Promise<PostSocial> {
    return this.postsRepository.updatePost(id, updatePostDto, user);
  }

  public async setImage(id: number, imgUrl: string) {
    this.postsRepository.update(id, { img: imgUrl });
  }
}
