import { Controller, Get, Res } from '@nestjs/common'
import { AllowAnonymous, AuthService } from '@thallesp/nestjs-better-auth'
import type { Response } from 'express'

interface AuthApiWithSchema {
  generateOpenAPISchema: () => Promise<object>
}

@Controller('auth-docs')
export class AuthDocsController {
  constructor(private authService: AuthService) {}

  @Get()
  @AllowAnonymous()
  async getAuthDocs(@Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const authApi = this.authService.api as unknown as AuthApiWithSchema
    const schema = await authApi.generateOpenAPISchema()
    const jsonString = JSON.stringify(schema)

    res.set({
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(jsonString, 'utf8'),
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    })

    res.send(jsonString)
  }
}
