import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repository: Repository<User>) {}

  async create(email: string, password: string): Promise<User> {
    const user = await this.repository.create({ email, password });

    return this.repository.save(user);
  }

  async findOne(id: number): Promise<User | null> {
    if (!id) {
      return null;
    }

    return this.repository.findOneBy({ id });
  }

  async getUser(id: number): Promise<User> {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`user with id ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.repository.findOneBy({ email });
  }

  async update(
    id: number,
    updateValues: Partial<Omit<User, 'id'>>,
  ): Promise<User> {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`user with id ${id} not found`);
    }

    Object.assign(user, updateValues);
    return this.repository.save(user);
  }

  async remove(id: number): Promise<User> {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`user with id ${id} not found`);
    }

    return this.repository.remove(user);
  }
}
