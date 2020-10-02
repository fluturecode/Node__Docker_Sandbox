import { Controller, UseGuards, Get, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { HasRoleGuard } from '@guards';
import { GetCurrentUser, RequiredRoles } from '@decorators';
import { Role, User, UserRoles } from '@models';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleService } from './role.service';

@ApiTags('Roles')
@UseGuards(JwtAuthGuard, HasRoleGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('roles')
export class RoleController {
  constructor(
    private roleService: RoleService
  ) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Returns an array of allowed user roles', type: Role, isArray: true })
  @ApiResponse({ status: 401, description: 'Authentication token is missing or has expired' })
  @ApiResponse({ status: 403, description: 'Denied access to a user who cannot view roles' })
  @RequiredRoles([UserRoles.ADMIN, UserRoles.SUPER_ADMIN])
  @Get('')
  async getUserRoles(
    @GetCurrentUser() user: User,
  ): Promise<Role[]> {
    return this.roleService.getUserRoles(user.role);
  }
}
