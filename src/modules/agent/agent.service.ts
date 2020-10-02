import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { AgentCreationDto } from './dto/agent-creation.dto';
import { AgentUpdateDto } from './dto/agent-update.dto';
import { Address, Agent, AgentRepository, User, AddressRepository } from '@models';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(AddressRepository)
    private addressRepository: AddressRepository,
    @InjectRepository(AgentRepository)
    private agentRepository: AgentRepository
  ) {}

  async createAgent(currentUser: User, agentData: AgentCreationDto): Promise<Agent> {
    const newAgent: Agent = this.agentRepository.create(),
      agentAddress: Address = this.addressRepository.create({
        ...agentData.address,
        agency: currentUser.agency
      });

    agentData.address = await agentAddress.save();

    Object.assign(newAgent, {
      agency: currentUser.agency,
      ...agentData
    });

    return newAgent.save();
  }

  async getAllAgents(currentUser: User): Promise<Agent[]> {
    return this.agentRepository.getAllAgents(currentUser);
  }

  async getOneAgent(currentUser: User, agentId: number): Promise<Agent> {
    const agent: Agent = await this.agentRepository.getOneAgent(currentUser, agentId);

    if (!agent) {
      throw new NotFoundException(`Unable to find agent with id: ${agentId}`);
    }

    return agent;
  }

  async softDeleteAgent(currentUser: User, agentId: number): Promise<Agent> {
    const agent: Agent = await this.getOneAgent(currentUser, agentId);

    agent.softDelete(currentUser.id);

    if (agent.address) {
      agent.address.softDelete(currentUser.id);

      await agent.address.save();
    }

    return agent.save();
  }

  async updateAgent(currentUser: User, agentId: number, agentData: AgentUpdateDto): Promise<Agent> {
    const agent: Agent = await this.getOneAgent(currentUser, agentId);

    if (agentData.address) {
      Object.assign(agent.address, agentData.address);

      agentData.address = await agent.address.save();
    }

    Object.assign(agent, agentData);

    return agent.save();
  }
}
