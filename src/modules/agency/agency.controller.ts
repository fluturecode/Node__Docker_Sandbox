import {
  Body,
  Controller,
  ClassSerializerInterceptor,
  Delete,
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
import { RequiredRoles, GetCurrentUser } from '@decorators';
import { Agency, User, UserRoles } from '@models';
import { HasRoleGuard } from '@guards';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AgencyService } from './agency.service';

import { AgencyCreationDto } from './dto/agency-creation.dto';
import { AgencyUpdateDto } from './dto/agency-update.dto';

@ApiTags('Agencies')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard, HasRoleGuard)
@Controller('agencies')
export class AgencyController {
  constructor(
    private agencyService: AgencyService
  ) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Creates a new agency', type: Agency })
  @ApiResponse({ status: 401, description: 'Invalid/expired authorization token' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @RequiredRoles([UserRoles.SUPER_ADMIN])
  @Post('')
  async createAgency(
    @GetCurrentUser() user: User,
    @Body(ValidationPipe) agencyCreationDto: AgencyCreationDto,
  ): Promise<Agency> {
    return this.agencyService.createAgency(user, agencyCreationDto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Returns all agencies', type: Agency, isArray: true })
  @ApiResponse({ status: 401, description: 'Invalid/expired authorization token' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @RequiredRoles([UserRoles.SUPER_ADMIN])
  @Get('')
  async getAllAgencies(): Promise<Agency[]> {
    return this.agencyService.getAllAgencies();
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Returns a single agency', type: Agency })
  @ApiResponse({ status: 401, description: 'Invalid/expired authorization token' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Unable to find agency' })
  @RequiredRoles([UserRoles.SUPER_ADMIN])
  @Get(':id')
  async getSingleAgency(
    @Param('id', ParseIntPipe) id: number
  ): Promise<Agency> {
    return this.agencyService.getSingleAgency(id);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Deletes a single agency', type: Agency })
  @ApiResponse({ status: 401, description: 'Invalid/expired authorization token' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Unable to find agency' })
  @RequiredRoles([UserRoles.SUPER_ADMIN])
  @Delete(':id')
  async softDeleteAgency(
    @GetCurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number
  ): Promise<Agency> {
    return this.agencyService.softDeleteAgency(user, id);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Updates a single agency', type: Agency })
  @ApiResponse({ status: 401, description: 'Invalid/expired authorization token' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Unable to find agency' })
  @RequiredRoles([UserRoles.SUPER_ADMIN])
  @Put(':id')
  async updateSingleAgency(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) agencyUpdateDto: AgencyUpdateDto,
  ): Promise<Agency> {
    return this.agencyService.updateSingleAgency(id, agencyUpdateDto);
  }
}
