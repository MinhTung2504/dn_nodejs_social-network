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
  UseGuards,
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
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/models/user.entity';
import { Role } from 'src/auth/models/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { hasRoles } from 'src/auth/decorators/roles.decorator';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @hasRoles(Role.USER, Role.ADMIN)
  @UseGuards(AuthGuard(), RolesGuard)
  @Get()
  getAllPosts(
    @Query() filterDto: GetPostsFilterDto,
    @GetUser() user: User,
  ): Promise<PostSocial[]> {
    return this.postsService.getPosts(filterDto, user);
  }

  @hasRoles(Role.USER, Role.ADMIN)
  @UseGuards(AuthGuard(), RolesGuard)
  @Get('/:id')
  getTaskById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<PostSocial> {
    return this.postsService.getPostById(id, user);
  }

  @hasRoles(Role.USER)
  @UseGuards(AuthGuard(), RolesGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post()
  createTask(
    @Body() createPostDto: ActionPostDto,
    @GetUser() user: User,
  ): Promise<PostSocial> {
    return this.postsService.createPost(createPostDto, user);
  }

  @hasRoles(Role.USER, Role.ADMIN)
  @UseGuards(AuthGuard(), RolesGuard)
  @Delete('/:id')
  deleteTask(@Param('id') id: string, @GetUser() user: User): Promise<string> {
    return this.postsService.deletePost(id, user);
  }

  @hasRoles(Role.USER)
  @UseGuards(AuthGuard(), RolesGuard)
  @Put('/:id')
  updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: ActionPostDto,
    @GetUser() user: User,
  ): Promise<PostSocial> {
    return this.postsService.updatePost(id, updatePostDto, user);
  }

  @hasRoles(Role.USER)
  @UseGuards(AuthGuard(), RolesGuard)
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
