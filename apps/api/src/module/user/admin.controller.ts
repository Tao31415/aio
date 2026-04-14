import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiParam,
} from '@nestjs/swagger'
import { Session } from '@thallesp/nestjs-better-auth'
import type { UserSession } from '@thallesp/nestjs-better-auth'
import { AdminService } from './admin.service'
import { UserRole } from '@auth/entities/user.entity'
import { Roles, RolesGuard } from '@/common'
import {
  UpdateUserByAdminDto,
  UpdateUserRoleDto,
  UserQueryDto,
  UserResponseDto,
  PaginatedUsersResponseDto,
} from './dto'

@Controller('admin')
@ApiTags('admin')
@ApiCookieAuth()
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==================== STATS ====================

  @Get('stats')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Returns dashboard statistics' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getStats() {
    return this.adminService.getStats()
  }

  // ==================== USER MANAGEMENT ====================

  @Get('users')
  @ApiOperation({ summary: 'List all users with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of users',
    type: PaginatedUsersResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async listUsers(@Query() query: UserQueryDto) {
    return this.adminService.findAllUsers(query)
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get a specific user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns user details',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getUser(@Param('id') id: string) {
    return this.adminService.findUserById(id)
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserByAdminDto
  ) {
    return this.adminService.updateUser(id, updateDto)
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: "Update a user's role" })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User role updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async updateUserRole(
    @Param('id') id: string,
    @Body() roleDto: UpdateUserRoleDto
  ) {
    return this.adminService.updateUserRole(id, roleDto.role)
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete your own account' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async deleteUser(@Param('id') id: string, @Session() session: UserSession) {
    await this.adminService.deleteUser(id, session.user.id)
    return { message: 'User deleted successfully' }
  }
}
