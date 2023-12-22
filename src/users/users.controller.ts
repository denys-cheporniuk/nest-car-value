import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('auth')
export class UsersController {
  @Post('/signup')
  async createUser(@Body() body: CreateUserDto) {
    console.log(body);
  }
}
