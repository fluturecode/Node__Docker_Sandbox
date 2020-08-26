import { Test, TestingModule } from '@nestjs/testing';
import { AgentService } from './agent.service';
import { AgentRepository, AddressRepository } from '@entities';

describe('AgentService', () => {
  let service: AgentService;

  const mockAgentRespository = () => ({}),
    mockAddressRespository = () => ({});

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentService,
        {
          provide: AgentRepository,
          useFactory: mockAgentRespository
        },
        {
          provide: AddressRepository,
          useFactory: mockAddressRespository
        }
      ],
    }).compile();

    service = module.get<AgentService>(AgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
