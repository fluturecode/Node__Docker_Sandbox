import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AgencyRepository, UserRepository, RoleRepository } from '@entities';

describe('User Controller', () => {
  let controller: UserController;

  const mockAgencyRepository = () => ({}),
    mockRoleRepository = () => ({}),
    mockUserRepository = () => ({});

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: AgencyRepository,
          useFactory: mockAgencyRepository
        },
        {
          provide: RoleRepository,
          useFactory: mockRoleRepository
        },
        {
          provide: UserRepository,
          useFactory: mockUserRepository
        }
      ]
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
