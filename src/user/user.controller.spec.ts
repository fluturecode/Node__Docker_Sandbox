import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository, RoleRepository } from '@entities';

describe('User Controller', () => {
  let controller: UserController;

  const mockRoleRespository = () => ({}),
    mockUserRespository = () => ({});

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: RoleRepository,
          useFactory: mockRoleRespository
        },
        {
          provide: UserRepository,
          useFactory: mockUserRespository
        }
      ]
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
