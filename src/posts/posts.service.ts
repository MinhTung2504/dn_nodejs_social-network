import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

  public createPost(createPostDto: ActionPostDto): Promise<PostSocial> {
    return this.postsRepository.createPost(createPostDto);
  }

  public getPosts(filterDto: GetPostsFilterDto): Promise<PostSocial[]> {
    return this.postsRepository.getPosts(filterDto);
  }

  public async getPostById(id: string): Promise<PostSocial> {
    return this.postsRepository.getPostById(id);
  }

  public async deletePost(id: string): Promise<string> {
    return this.postsRepository.deletePost(id);
  }

  public async updatePost(
    id: string,
    updatePostDto: ActionPostDto,
  ): Promise<PostSocial> {
    return this.postsRepository.updatePost(id, updatePostDto);
  }

  public async setImage(id: number, imgUrl: string) {
    this.postsRepository.update(id, { img: imgUrl });
  }
}
