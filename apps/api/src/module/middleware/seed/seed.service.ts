import { ForbiddenException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { AuthService } from '@thallesp/nestjs-better-auth'
import { DataSource, Repository } from 'typeorm'
import { User } from '@auth/entities/user.entity'

interface AuthApiSignupEmailInput {
  email: string
  password: string
  name: string
  username: string
  displayUsername: string
}

interface AuthApiSignUpEmailArgs {
  body: AuthApiSignupEmailInput
}

interface AuthApiWithSignUpEmail {
  signUpEmail: (args: AuthApiSignUpEmailArgs) => Promise<unknown>
}

@Injectable()
export class SeedService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly authService: AuthService
  ) {}

  async createTables() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Seed is disabled in production')
    }

    await this.dataSource.synchronize(false)

    const seedUser: AuthApiSignupEmailInput = {
      email: 'admin@example.com',
      password: 'password123',
      name: 'Admin User',
      username: 'admin',
      displayUsername: 'Admin User',
    }

    const existingUser = await this.userRepo.findOne({
      where: [{ email: seedUser.email }, { username: seedUser.username }],
    })

    let userCreated = false
    if (!existingUser) {
      const authApi = this.authService.api as unknown as AuthApiWithSignUpEmail
      await authApi.signUpEmail({ body: seedUser })
      userCreated = true
    }

    return {
      ok: true,
      entities: this.dataSource.entityMetadatas.map((m) => m.name),
      userCreated,
    }
  }
}
