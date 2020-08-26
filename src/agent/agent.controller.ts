import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete ,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  ValidationPipe
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

import { AgentCreationDto } from './dto/agent-creation.dto';
import { AgentUpdateDto } from './dto/agent-update.dto';
import { Agent, User } from '@entities';

import { AgentService } from './agent.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCurrentUser } from '@decorators';

@ApiTags('Agents')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('agents')
export class AgentController {
  constructor(
    private agentService: AgentService
  ) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Agent created successfully', type: Agent })
  @ApiResponse({ status: 401, description: 'Invalid authorization token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(JwtAuthGuard)
  @Post('')
  async createAgent(
    @GetCurrentUser() user: User,
    @Body(ValidationPipe) agentCreationDto: AgentCreationDto
  ): Promise<Agent> {
    return this.agentService.createAgent(user, agentCreationDto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Agents fetched successfully', type: Agent, isArray: true })
  @ApiResponse({ status: 401, description: 'Invalid authorization token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(JwtAuthGuard)
  @Get('')
  async getAllAgents(
    @GetCurrentUser() user: User,
  ): Promise<Agent[]> {
    return this.agentService.getAllAgents(user);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Agent fetched successfully', type: Agent })
  @ApiResponse({ status: 401, description: 'Invalid authorization token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOneAgent(
    @GetCurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number
  ): Promise<Agent> {
    return this.agentService.getOneAgent(user, id);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Agent deleted successfully', type: Agent })
  @ApiResponse({ status: 401, description: 'Invalid authorization token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async softDeleteAgent(
    @GetCurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number
  ): Promise<Agent> {
    return this.agentService.softDeleteAgent(user, id);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Agent updated successfully', type: Agent })
  @ApiResponse({ status: 401, description: 'Invalid authorization token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateAgent(
    @GetCurrentUser() user: User,
    @Body(ValidationPipe) agentUpdateDto: AgentUpdateDto,
    @Param('id', ParseIntPipe) id: number
  ): Promise<Agent> {
    return this.agentService.updateAgent(user, id, agentUpdateDto);
  }
}
