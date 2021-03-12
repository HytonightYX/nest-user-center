import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class UserDto {
  @ApiProperty({
    name: 'name',
    type: String,
    required: false,
    description: 'name',
  })
  name?: string;

  @IsEmail()
  @ApiProperty({
    name: 'email',
    type: String,
    required: false,
    description: 'email',
  })
  email?: string;

  @ApiProperty({
    name: 'password',
    type: String,
    required: false,
    description: 'password',
  })
  password?: string;
}

export class LoginDto extends UserDto {}

export class UpdateUserDto extends UserDto {}

export class FindUserDto extends UserDto {
  @ApiProperty({
    name: 'id',
    type: String,
    required: false,
    description: 'id',
  })
  id?: string;
}

export class CreateUserDto {
  @IsNotEmpty({ message: 'name is not allowed to be null' })
  @ApiProperty({
    name: 'name',
    type: String,
    required: true,
    description: 'name',
  })
  name: string;

  @IsEmail()
  @IsNotEmpty({ message: 'email is not allowed to be null' })
  @ApiProperty({
    name: 'email',
    type: String,
    required: true,
    description: 'email',
  })
  email: string;

  @IsNotEmpty({ message: 'password is not allowed to be null' })
  @ApiProperty({
    name: 'password',
    type: String,
    required: true,
    description: 'password',
  })
  password: string;
}
