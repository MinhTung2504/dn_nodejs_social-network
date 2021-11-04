import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [TypeOrmModule.forRoot(), PostsModule, AuthModule],
  controllers: [],
})
export class AppModule {}
