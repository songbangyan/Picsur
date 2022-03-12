import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Post
} from '@nestjs/common';
import {
  RoleCreateRequest,
  RoleCreateResponse,
  RoleDeleteRequest,
  RoleDeleteResponse,
  RoleInfoRequest,
  RoleInfoResponse,
  RoleListResponse,
  RoleUpdateRequest,
  RoleUpdateResponse
} from 'picsur-shared/dist/dto/api/roles.dto';
import { HasFailed } from 'picsur-shared/dist/types';
import { RolesService } from '../../../collections/roledb/roledb.service';
import { RequiredPermissions } from '../../../decorators/permissions.decorator';

@Controller('api/roles')
@RequiredPermissions('role-manage')
export class RolesController {
  private readonly logger = new Logger('RolesController');

  constructor(private rolesService: RolesService) {}

  @Get('/list')
  async getRoles(): Promise<RoleListResponse> {
    const roles = await this.rolesService.findAll();
    if (HasFailed(roles)) {
      this.logger.warn(roles.getReason());
      throw new InternalServerErrorException('Could not list roles');
    }

    return {
      roles,
      total: roles.length,
    };
  }

  @Post('/info')
  async getRole(@Body() body: RoleInfoRequest): Promise<RoleInfoResponse> {
    const role = await this.rolesService.findOne(body.name);
    if (HasFailed(role)) {
      this.logger.warn(role.getReason());
      throw new InternalServerErrorException('Could not find role');
    }

    return role;
  }

  @Post('/permissions')
  async updateRole(
    @Body() body: RoleUpdateRequest,
  ): Promise<RoleUpdateResponse> {
    const updatedRole = await this.rolesService.setPermissions(
      body.name,
      body.permissions,
    );
    if (HasFailed(updatedRole)) {
      this.logger.warn(updatedRole.getReason());
      throw new InternalServerErrorException('Could not set role permissions');
    }

    return updatedRole;
  }

  @Post('/create')
  async createRole(
    @Body() role: RoleCreateRequest,
  ): Promise<RoleCreateResponse> {
    const newRole = await this.rolesService.create(role.name, role.permissions);
    if (HasFailed(newRole)) {
      this.logger.warn(newRole.getReason());
      throw new InternalServerErrorException('Could not create role');
    }

    return newRole;
  }

  @Post('/delete')
  async deleteRole(
    @Body() role: RoleDeleteRequest,
  ): Promise<RoleDeleteResponse> {
    const deletedRole = await this.rolesService.delete(role.name);
    if (HasFailed(deletedRole)) {
      this.logger.warn(deletedRole.getReason());
      throw new InternalServerErrorException('Could not delete role');
    }

    return deletedRole;
  }
}
