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

import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';

import { AgentCreationDto } from './dto/agent-creation.dto';
import { AgentUpdateDto } from './dto/agent-update.dto';
import { Agent, User, UserRoles } from '@models';

import { AgentService } from './agent.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCurrentUser, RequiredRoles } from '@decorators';
import { HasRoleGuard } from '@guards';

// Setting this here since the context of `this` is lost when passing values to the decorators
const requiredAgentCrudRoles: UserRoles[] = [UserRoles.SUPER_ADMIN, UserRoles.ADMIN, UserRoles.EDITOR];

@ApiTags('Agents')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('agents')
export class AgentController {
  constructor(
    private agentService: AgentService
  ) {}

  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Agent created successfully', type: Agent })
  @ApiUnauthorizedResponse({ description: 'Invalid authorization token' })
  @ApiForbiddenResponse({ description: 'Access denied' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @RequiredRoles(requiredAgentCrudRoles)
  @UseGuards(JwtAuthGuard, HasRoleGuard)
  @Post('')
  async createAgent(
    @GetCurrentUser() user: User,
    @Body(ValidationPipe) agentCreationDto: AgentCreationDto
  ): Promise<Agent> {
    return this.agentService.createAgent(user, agentCreationDto);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Agents fetched successfully', type: Agent, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Invalid authorization token' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @UseGuards(JwtAuthGuard)
  @Get('')
  async getAllAgents(
    @GetCurrentUser() user: User,
  ): Promise<Agent[]> {
    return this.agentService.getAllAgents(user);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Agent fetched successfully', type: Agent })
  @ApiUnauthorizedResponse({ description: 'Invalid authorization token' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOneAgent(
    @GetCurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number
  ): Promise<Agent> {
    return this.agentService.getOneAgent(user, id);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Agent deleted successfully', type: Agent })
  @ApiUnauthorizedResponse({ description: 'Invalid authorization token' })
  @ApiForbiddenResponse({ description: 'Access denied' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @RequiredRoles(requiredAgentCrudRoles)
  @UseGuards(JwtAuthGuard, HasRoleGuard)
  @Delete(':id')
  async softDeleteAgent(
    @GetCurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number
  ): Promise<Agent> {
    return this.agentService.softDeleteAgent(user, id);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Agent updated successfully', type: Agent })
  @ApiUnauthorizedResponse({ description: 'Invalid authorization token' })
  @ApiForbiddenResponse({ description: 'Access denied' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @RequiredRoles(requiredAgentCrudRoles)
  @UseGuards(JwtAuthGuard, HasRoleGuard)
  @Put(':id')
  async updateAgent(
    @GetCurrentUser() user: User,
    @Body(ValidationPipe) agentUpdateDto: AgentUpdateDto,
    @Param('id', ParseIntPipe) id: number
  ): Promise<Agent> {
    return this.agentService.updateAgent(user, id, agentUpdateDto);
  }
}
