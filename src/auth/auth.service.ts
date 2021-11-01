import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DUPLICATE_ERROR } from 'src/utils/constants';
import {
  user_email_existed,
  user_email_not_found,
  user_error_login_credentials,
} from 'src/utils/messages';
import { Repository } from 'typeorm';
import { AuthCredentialsDto } from './dtos/auth-credentials.dto';
import { JwtPayload } from './jwt-payload.interface';
import { User } from './models/user.entity';
import stringInject from 'stringinject';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async findUserByEmail(email: string): Promise<User> {
    const post = await this.usersRepository.findOne({ email });

    if (!post) {
      throw new NotFoundException(stringInject(user_email_not_found, [email]));
    }

    return post;
  }

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<string> {
    const { password, ...rest } = authCredentialsDto;

    // Hash Password with Salt
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.usersRepository.create({
      ...rest,
      password: hashedPassword,
    });

    try {
      await this.usersRepository.save(user);
    } catch (error) {
      // Duplicate Code
      if (error.code === DUPLICATE_ERROR) {
        throw new ConflictException(user_email_existed);
      } else {
        throw new InternalServerErrorException();
      }
    }
    return 'Successfully!';
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken }> {
    const { email, password } = authCredentialsDto;

    const user = await this.findUserByEmail(email);

    if (await bcrypt.compare(password, user.password)) {
      const payload: JwtPayload = {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        gender: user.gender,
        role: user.role,
      };
      const accessToken = await this.jwtService.sign(payload);

      return { accessToken };
    } else {
      throw new UnauthorizedException(user_error_login_credentials);
    }
  }

  public async setImage(id: number, imgUrl: string) {
    this.usersRepository.update(id, { avatar: imgUrl });
  }
}
