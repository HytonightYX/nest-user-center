import { ApiTags } from '@nestjs/swagger';
import { headersConstant } from '@common/constant';
import { Body, Controller, Headers, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { UserService } from './service';
import { LoginDto, CreateUserDto, UpdateUserDto } from './dto';

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

  @Post('signIn')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() dto: LoginDto) {
    const result = await this.service.signIn(dto);
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

  @Post('edit')
  @HttpCode(HttpStatus.OK)
  async edit(@Body() dto: UpdateUserDto, @Headers(headersConstant.requestToken) token: string) {
    const result = await this.service.edit(dto, token);
    return result;
  }
}
