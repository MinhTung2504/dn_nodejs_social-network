import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user.entity';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './guards/jwt.strategy';
import { UserController } from './controllers/users.controller';
import { AuthService } from './services/auth.service';
import { UserService } from './services/users.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: {
        expiresIn: parseInt(process.env.EXPIRES_IN),
      },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [AuthService, JwtStrategy, UserService],
  controllers: [AuthController, UserController],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
