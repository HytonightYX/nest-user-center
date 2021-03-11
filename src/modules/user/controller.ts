import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Headers, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { UserService } from './service';
import { LoginDto, CreateUserDto } from './dto';
import { headersConstant } from '@common/constant';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post('signUp')
  @HttpCode(HttpStatus.OK)
  async signUp(@Body() dto: CreateUserDto) {
    const result = await this.service.signUp(dto);
    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const result = await this.service.login(dto);
    return result;
  }

  @Post('signOut')
  @HttpCode(HttpStatus.OK)
  async signOut(@Headers(headersConstant.requestToken) token: string) {
    const result = await this.service.signOut(token);
    return result;
  }

  @Post('authToken')
  @HttpCode(HttpStatus.OK)
  async authToken(@Headers(headersConstant.requestToken) token: string) {
    const result = await this.service.authToken(token);
    return result;
  }
}
