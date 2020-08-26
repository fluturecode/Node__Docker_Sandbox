import { EntityRepository, Repository } from "typeorm";

import { Agent, User } from '@entities';

@EntityRepository(Agent)
export class AgentRepository extends Repository<Agent> {
  getAllAgents(currentUser: User): Promise<Agent[]> {
    return this.find({ agency: currentUser.agency });
  }

  getOneAgent(currentUser: User, agentId: number): Promise<Agent> {
    return this.findOne({ id: agentId, agency: currentUser.agency });
  }
}