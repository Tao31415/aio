import { Controller, Get, Post, Body, Req, Query } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger'
import { Session, OptionalAuth } from '@thallesp/nestjs-better-auth'
import type { UserSession } from '@thallesp/nestjs-better-auth'
import type { Request } from 'express'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { auth } from './auth'
import { User } from './entities/user.entity'
import {
  RevokeSessionDto,
  SendVerificationEmailDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  UpdateUserDto,
  ChangePasswordDto,
  SessionTokenDto,
} from './dto'

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  // ==================== SESSION ROUTES ====================

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Returns user profile and session' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Session() session: UserSession) {
    // Fetch user with role from database
    const userWithRole = await this.userRepository.findOne({
      where: { id: session.user.id },
    })

    return {
      user: {
        ...session.user,
        role: userWithRole?.role ?? 'user',
      },
      session: session.session,
    }
  }

  @Get('session')
  @OptionalAuth()
  @ApiOperation({ summary: 'Get current session (optional auth)' })
  @ApiResponse({ status: 200, description: 'Returns authentication status' })
  async getSession(@Session() session: UserSession | null) {
    if (!session?.user) {
      return { authenticated: false, user: null }
    }

    // Fetch user with role from database
    const userWithRole = await this.userRepository.findOne({
      where: { id: session.user.id },
    })

    return {
      authenticated: true,
      user: {
        ...session.user,
        role: userWithRole?.role ?? 'user',
      },
    }
  }

  @Get('sessions')
  @ApiTags('sessions')
  @ApiOperation({ summary: 'List all active sessions' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Returns list of active sessions' })
  async listSessions(@Req() req: Request) {
    const result = await auth.api.listSessions({
      headers: req.headers as unknown as Headers,
    })
    return result
  }

  @Post('sessions/revoke')
  @ApiTags('sessions')
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Session revoked successfully' })
  async revokeSession(@Body() body: RevokeSessionDto, @Req() req: Request) {
    const result = await auth.api.revokeSession({
      body: { token: body.token },
      headers: req.headers as unknown as Headers,
    })
    return result
  }

  @Post('sessions/revoke-other')
  @ApiTags('sessions')
  @ApiOperation({ summary: 'Revoke all other sessions except current' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Other sessions revoked' })
  async revokeOtherSessions(@Req() req: Request) {
    const result = await auth.api.revokeOtherSessions({
      headers: req.headers as unknown as Headers,
    })
    return result
  }

  @Post('sessions/revoke-all')
  @ApiTags('sessions')
  @ApiOperation({ summary: 'Revoke all sessions' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'All sessions revoked' })
  async revokeSessions(@Req() req: Request) {
    const result = await auth.api.revokeSessions({
      headers: req.headers as unknown as Headers,
    })
    return result
  }

  // ==================== EMAIL VERIFICATION ROUTES ====================

  @Post('send-verification-email')
  @OptionalAuth()
  @ApiTags('verification')
  @ApiOperation({ summary: 'Send email verification link' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  async sendVerificationEmail(
    @Body() body: SendVerificationEmailDto,
    @Req() req: Request
  ) {
    const result = await auth.api.sendVerificationEmail({
      body: {
        email: body.email,
        callbackURL: body.callbackURL || '/',
      },
      headers: req.headers as unknown as Headers,
    })
    return result
  }

  @Get('verify-email')
  @ApiTags('verification')
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Query('token') token: string) {
    const result = await auth.api.verifyEmail({
      query: { token },
    })
    return result
  }

  // ==================== PASSWORD RESET ROUTES ====================

  @Post('request-password-reset')
  @ApiTags('verification')
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  async requestPasswordReset(
    @Body() body: RequestPasswordResetDto,
    @Req() req: Request
  ) {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
    const result = await (auth.api as any).forgetPassword({
      body: {
        email: body.email,
        redirectTo: body.redirectTo || '/reset-password',
      },
      headers: req.headers as unknown as Headers,
    })
    return result
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
  }

  @Post('reset-password')
  @ApiTags('verification')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() body: ResetPasswordDto, @Req() req: Request) {
    const result = await auth.api.resetPassword({
      body: {
        token: body.token,
        newPassword: body.newPassword,
      },
      headers: req.headers as unknown as Headers,
    })
    return result
  }

  // ==================== USER MANAGEMENT ROUTES ====================

  @Post('user/update')
  @ApiTags('user')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async updateUser(@Body() body: UpdateUserDto, @Req() req: Request) {
    const result = await auth.api.updateUser({
      body,
      headers: req.headers as unknown as Headers,
    })
    return result
  }

  @Post('user/change-password')
  @ApiTags('user')
  @ApiOperation({ summary: 'Change user password' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(@Body() body: ChangePasswordDto, @Req() req: Request) {
    const result = await auth.api.changePassword({
      body,
      headers: req.headers as unknown as Headers,
    })
    return result
  }

  // ==================== ACCOUNT ROUTES ====================

  @Get('accounts')
  @ApiTags('user')
  @ApiOperation({ summary: 'List user accounts' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Returns list of user accounts' })
  async listAccounts(@Req() req: Request) {
    /* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    return await (auth.api as any).listUserAccounts({
      headers: req.headers as unknown as Headers,
    })
    /* eslint-enable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  }

  // ==================== MULTI-SESSION ROUTES ====================

  @Get('device-sessions')
  @ApiTags('multi-session')
  @ApiOperation({ summary: 'List all sessions on this device' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Returns list of device sessions' })
  async listDeviceSessions(@Req() req: Request) {
    /* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    return await (auth.api as any).listDeviceSessions({
      headers: req.headers as unknown as Headers,
    })
    /* eslint-enable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  }

  @Post('device-sessions/set-active')
  @ApiTags('multi-session')
  @ApiOperation({ summary: 'Set active session (switch accounts)' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Active session changed' })
  async setActiveSession(@Body() body: SessionTokenDto, @Req() req: Request) {
    /* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    return await (auth.api as any).setActiveSession({
      body: { sessionToken: body.sessionToken },
      headers: req.headers as unknown as Headers,
    })
    /* eslint-enable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  }

  @Post('device-sessions/revoke')
  @ApiTags('multi-session')
  @ApiOperation({ summary: 'Revoke a device session' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Device session revoked' })
  async revokeDeviceSession(
    @Body() body: SessionTokenDto,
    @Req() req: Request
  ) {
    /* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    return await (auth.api as any).revokeDeviceSession({
      body: { sessionToken: body.sessionToken },
      headers: req.headers as unknown as Headers,
    })
    /* eslint-enable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  }

  // ==================== SIGN OUT ====================

  @Post('sign-out')
  @ApiOperation({
    summary: 'Sign out (revokes all sessions with multi-session)',
  })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Signed out successfully' })
  async signOut(@Req() req: Request) {
    const result = await auth.api.signOut({
      headers: req.headers as unknown as Headers,
    })
    return result
  }
}
