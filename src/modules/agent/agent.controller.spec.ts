import { Test, TestingModule } from '@nestjs/testing';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { AgentRepository, AddressRepository } from '@models';

describe('Agent Controller', () => {
  let controller: AgentController;

  const mockAgentRespository = () => ({}),
    mockAddressRespository = () => ({});

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentController],
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
      ]
    }).compile();

    controller = module.get<AgentController>(AgentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
