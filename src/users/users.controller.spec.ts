import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from './auth.service';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    let users: User[] = [
      {
        id: 1,
        email: 'test@test.com',
        password: '123',
      } as User,
    ];

    fakeUsersService = {
      getUser: (id: number) => {
        const user = users.find((u) => u.id === id);

        return Promise.resolve(user);
      },
      findByEmail: (email: string) => {
        const user = users.find((u) => u.email === email);

        return Promise.resolve(user || null);
      },
      remove: (id: number) => {
        const user = users.find((u) => u.id === id);
        users = users.filter((u) => u.id !== id);

        return Promise.resolve(user);
      },
      update: (id: number, updateValues: UpdateUserDto) => {
        const user = users.find((u) => u.id === id);
        Object.assign(user, updateValues);

        return Promise.resolve(user);
      },
    };

    fakeAuthService = {
      signup: (email: string, password: string) => {
        const id = Math.floor(Math.random() * 99999);
        const user = { id, email, password } as User;

        users.push(user);

        return Promise.resolve(user);
      },
      signin: (email: string, password: string) => {
        const user = { id: 1, email, password } as User;

        return Promise.resolve(user);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('users controller should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return user by provided email', async () => {
    const user = await controller.findUserByEmail('test@test.com');

    expect(user).toBeDefined();
  });

  it('should return null if users does not exist with provided email', async () => {
    const user = await controller.findUserByEmail('test123@test.com');

    expect(user).toBeNull();
  });

  it('signin should update session object and returns user', async () => {
    const session = { userId: -1 };
    const user = await controller.signin(
      { email: 'test@test.com', password: '12345' },
      session,
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
