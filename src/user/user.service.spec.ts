import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { AgencyRepository, UserRepository, RoleRepository } from '@entities';

describe('UserService', () => {
  let service: UserService;

  const mockAgencyRepository = () => ({}),
    mockRoleRepository = () => ({}),
    mockUserRepository = () => ({});

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
