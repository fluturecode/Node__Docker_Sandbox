import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressRepository, AgentRepository } from '@entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AddressRepository,
      AgentRepository
    ])
  ],
  controllers: [AgentController],
  providers: [AgentService]
})
export class AgentModule {}
