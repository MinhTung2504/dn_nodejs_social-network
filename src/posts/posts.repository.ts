import { NotFoundException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { ActionPostDto } from './dtos/action-post.dto';
import { GetPostsFilterDto } from './dtos/get-posts-filter.dto';
import { PostSocial } from './post.entity';

@EntityRepository(PostSocial)
export class PostsRepository extends Repository<PostSocial> {
  async getPosts(filterDto: GetPostsFilterDto): Promise<PostSocial[]> {
    const { search } = filterDto;

    const query = this.createQueryBuilder('post-social');

    if (search) {
      query.andWhere('(LOWER(post-social.content) LIKE LOWER(:search))', {
        search: `%${search}%`,
      });
    }

    const posts = await query.getMany();
    return posts;
  }

  async createPost(createPostDto: ActionPostDto): Promise<PostSocial> {
    const post = this.create({ ...createPostDto });

    await this.save(post);

    return post;
  }

  async getPostById(id: string): Promise<PostSocial> {
    const found = await this.findOne(id);

    if (!found) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }

    return found;
  }

  async deletePost(id: string): Promise<string> {
    const found = await this.getPostById(id);

    await this.delete(found);

    return `Post with ID "${id}" have been DELETED`;
  }

  async updatePost(
    id: string,
    updatePostDto: ActionPostDto,
  ): Promise<PostSocial> {
    const post = await this.getPostById(id);
    const { content } = updatePostDto;
    post.content = content;

    await this.save(post);
    return post;
  }
}
