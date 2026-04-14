import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

// ==================== SESSION DTOs ====================

export class RevokeSessionDto {
  @ApiProperty({ description: 'The session token to revoke' })
  token: string
}

// ==================== EMAIL VERIFICATION DTOs ====================

export class SendVerificationEmailDto {
  @ApiProperty({ description: 'Email address to send verification to' })
  email: string

  @ApiPropertyOptional({
    description: 'URL to redirect after verification',
    default: '/',
  })
  callbackURL?: string
}

// ==================== PASSWORD RESET DTOs ====================

export class RequestPasswordResetDto {
  @ApiProperty({ description: 'Email address to send password reset to' })
  email: string

  @ApiPropertyOptional({
    description: 'URL to redirect for password reset',
    default: '/reset-password',
  })
  redirectTo?: string
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token from email' })
  token: string

  @ApiProperty({ description: 'New password to set', minLength: 8 })
  newPassword: string
}

// ==================== USER MANAGEMENT DTOs ====================

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'New name for the user' })
  name?: string

  @ApiPropertyOptional({ description: 'New profile image URL' })
  image?: string
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  currentPassword: string

  @ApiProperty({ description: 'New password to set', minLength: 8 })
  newPassword: string

  @ApiPropertyOptional({
    description: 'Whether to revoke other active sessions',
    default: false,
  })
  revokeOtherSessions?: boolean
}

// ==================== MULTI-SESSION DTOs ====================

export class SessionTokenDto {
  @ApiProperty({ description: 'The session token' })
  sessionToken: string
}
