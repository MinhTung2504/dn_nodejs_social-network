import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetPostsFilterDto } from './dtos/get-posts-filter.dto';
import { PostSocial } from './post.entity';
import { PostsService } from './posts.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ActionPostDto } from './dtos/action-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get()
  getAllPosts(@Query() filterDto: GetPostsFilterDto): Promise<PostSocial[]> {
    return this.postsService.getPosts(filterDto);
  }

  @Get('/:id')
  getTaskById(@Param('id') id: string): Promise<PostSocial> {
    return this.postsService.getPostById(id);
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @Post()
  createTask(@Body() createPostDto: ActionPostDto): Promise<PostSocial> {
    return this.postsService.createPost(createPostDto);
  }

  @Delete('/:id')
  deleteTask(@Param('id') id: string): Promise<string> {
    return this.postsService.deletePost(id);
  }

  @Put('/:id')
  updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: ActionPostDto,
  ): Promise<PostSocial> {
    return this.postsService.updatePost(id, updatePostDto);
  }

  @Post(':id/upload-img')
  @UseInterceptors(
    FileInterceptor('img', {
      storage: diskStorage({
        destination: './uploads/posts',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadAvatar(@Param('id') id, @UploadedFile() file) {
    this.postsService.setImage(Number(id), `${file.path}`);
  }
}
