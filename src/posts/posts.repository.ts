import { NotFoundException } from '@nestjs/common';
import { User } from 'src/auth/models/user.entity';
import { post_deleted_successed, post_not_found } from 'src/utils/messages';
import { EntityRepository, Repository } from 'typeorm';
import { ActionPostDto } from './dtos/action-post.dto';
import { GetPostsFilterDto } from './dtos/get-posts-filter.dto';
import { PostSocial } from './post.entity';
import stringInject from 'stringinject';

@EntityRepository(PostSocial)
export class PostsRepository extends Repository<PostSocial> {
  async getPosts(
    filterDto: GetPostsFilterDto,
    user: User,
  ): Promise<PostSocial[]> {
    const { search } = filterDto;

    const query = this.createQueryBuilder('post-social');
    query.where({ user });
    if (search) {
      query.andWhere('(LOWER(post-social.content) LIKE LOWER(:search))', {
        search: `%${search}%`,
      });
    }

    const posts = await query.getMany();
    return posts;
  }

  async createPost(
    createPostDto: ActionPostDto,
    user: User,
  ): Promise<PostSocial> {
    const post = this.create({ ...createPostDto, user });

    await this.save(post);

    return post;
  }

  async getPostById(id: string, user: User): Promise<PostSocial> {
    const post = await this.findOne({ where: { id, user } });

    if (!post) {
      throw new NotFoundException(stringInject(post_not_found, [id]));
    }

    return post;
  }

  async deletePost(id: string, user: User): Promise<string> {
    const post = await this.getPostById(id, user);

    await this.delete(post);

    return stringInject(post_deleted_successed, [id]);
  }

  async updatePost(
    id: string,
    updatePostDto: ActionPostDto,
    user: User,
  ): Promise<PostSocial> {
    const post = await this.getPostById(id, user);
    const { content } = updatePostDto;
    post.content = content;

    await this.save(post);
    return post;
  }
}
