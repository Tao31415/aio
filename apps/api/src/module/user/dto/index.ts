import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'
import { UserRole } from '../../auth/entities/user.entity'

export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'The new role for the user',
    enum: UserRole,
    example: UserRole.ADMIN,
  })
  @IsEnum(UserRole)
  role: UserRole
}

export class UpdateUserByAdminDto {
  @ApiPropertyOptional({ description: 'New name for the user' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ description: 'New email for the user' })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional({
    description: 'The role for the user',
    enum: UserRole,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole

  @ApiPropertyOptional({ description: 'Whether email is verified' })
  @IsOptional()
  emailVerified?: boolean
}

export class CreateUserDto {
  @ApiProperty({ description: 'User name' })
  @IsString()
  name: string

  @ApiProperty({ description: 'User email' })
  @IsEmail()
  email: string

  @ApiProperty({ description: 'User password', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string

  @ApiPropertyOptional({
    description: 'The role for the user',
    enum: UserRole,
    default: UserRole.USER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole
}

export class UserResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string

  @ApiProperty()
  email: string

  @ApiProperty()
  emailVerified: boolean

  @ApiProperty({ nullable: true })
  image: string | null

  @ApiProperty({ enum: UserRole })
  role: UserRole

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

export class PaginatedUsersResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  users: UserResponseDto[]

  @ApiProperty()
  total: number

  @ApiProperty()
  page: number

  @ApiProperty()
  limit: number

  @ApiProperty()
  totalPages: number
}

export class UserQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  limit?: number

  @ApiPropertyOptional({ description: 'Search by name or email' })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ description: 'Filter by role', enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole
}
