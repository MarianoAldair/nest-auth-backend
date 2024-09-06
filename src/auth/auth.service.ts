import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

// import { CreateUserDto } from './dto/create-user.dto';
// import { LoginDto } from './dto/login.dto';
// import { RegisterUserDto } from './dto/register-user.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';

import { CreateUserDto, LoginDto, RegisterUserDto, UpdateAuthDto } from './dto';

import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt.payload';
import { LoginResponse } from './interfaces/login-response';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {

    try
    {
      const { password, ...userData } = createUserDto;

      const newUser = new this.userModel({
        password: bcrypt.hashSync(password, 10),
        ...userData
      });

      await newUser.save();
      const { password:_, ...user } = newUser.toJSON();

      return user;
    } 
    catch (error)
    {
      if(error.code === 11000) {
        throw new BadRequestException(`Email ${createUserDto.email} already taken.`);
      }
      // console.log(error);
      throw new InternalServerErrorException('Error no manejado');
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });

    if(!user) {
      throw new UnauthorizedException('Not valid email');
    }

    if(!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Not valid password');
    }

    const { password:_, ...rest } = user.toJSON();

    return { 
      user: rest,
      token: await this.getJwt({ id: user.id })
    };
  }

  async register(registerUserDto: RegisterUserDto): Promise<LoginResponse> {
    
    const user = await this.create(registerUserDto);

    if(!user) {
      throw new InternalServerErrorException('Ocurrió un error al momento de crear el usuario');
    }

    const { id } = await this.userModel.findOne({ email: user.email });

    if(!id) {
      throw new InternalServerErrorException('No se ha encontrado al usuario');
    }

    return {
      user,
      token: await this.getJwt({ id })
    }
  }

  findAll(): Promise<User[]> {
    return this.userModel.find()
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async getJwt(payload: JwtPayload) {
    const token = await this.jwtService.signAsync(payload);
    return token;
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    const { password, ...rest } = user.toJSON();
    return rest;
  }
}
