import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository, RoleRepository } from '@entities';

describe('UserService', () => {
  let service: UserService;

  const mockRoleRespository = () => ({}),
    mockUserRespository = () => ({});

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
