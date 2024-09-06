import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';
// import { LoginDto } from './dto/login.dto';
// import { RegisterUserDto } from './dto/register-user.dto';

import { CreateUserDto, LoginDto, RegisterUserDto, UpdateAuthDto } from './dto';
import { AuthGuard } from './guards/auth.guard';
import { User } from './entities/user.entity';
import { LoginResponse } from './interfaces/login-response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/register')
  register(@Body() registerUserDto: RegisterUserDto) {
    console.log(registerUserDto)
    return this.authService.register(registerUserDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Request() request: Request) {
    // console.log("RequestFormController: ", request);
    const user = request['user'];

    // return user;
    return this.authService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('check-token')
  async checkToken(@Request() request: Request): Promise<LoginResponse> {
    const user = request['user'] as User;

    console.log("Usuario", user);

    return {
      user,
      token: await this.authService.getJwt({id: user._id })
    }
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
