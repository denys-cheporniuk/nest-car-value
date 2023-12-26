import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './users.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];

    fakeUsersService = {
      findByEmail: (email: string) => {
        const user = users.find((u) => u.email === email);

        return Promise.resolve(user || null);
      },

      create: (email: string, password: string) => {
        const id = Math.floor(Math.random() * 99999);
        const user = { id, email, password } as User;

        users.push(user);

        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  describe('User signup', () => {
    const password = '12345';
    const email = 'test@test.com';

    it('password should not be the same after user registration', async () => {
      const user = await service.signup(email, password);

      expect(user.password).not.toEqual(password);
    });

    it('salt and hash must be defined after user registration', async () => {
      const user = await service.signup(email, password);
      const [salt, hash] = user.password.split('.');

      expect(salt).toBeDefined();
      expect(hash).toBeDefined();
    });

    it('throws an error if user signs up with email that is in use', async () => {
      await service.signup(email, password);

      await expect(service.signup(email, password)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('User signin', () => {
    const password = '12345';
    const email = 'test@test.com';

    it('throws an error if signin is called with an unused email', async () => {
      await expect(service.signin(email, password)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws an error if an invalid password is provided', async () => {
      await service.signup(email, password);

      await expect(service.signin(email, 'random12345')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('returns user if correct email and password are provided', async () => {
      await service.signup(email, password);

      const user = await service.signin(email, password);

      await expect(user).toBeDefined();
    });
  });
});
