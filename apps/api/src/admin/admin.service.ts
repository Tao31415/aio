import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User, UserRole } from '../auth/entities/user.entity'
import {
  UpdateUserByAdminDto,
  UserQueryDto,
  PaginatedUsersResponseDto,
} from './dto'

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async findAllUsers(query: UserQueryDto): Promise<PaginatedUsersResponseDto> {
    const page = Number(query.page) || 1
    const limit = Math.min(Number(query.limit) || 10, 100)
    const skip = (page - 1) * limit

    const queryBuilder = this.userRepository.createQueryBuilder('user')

    if (query.role) {
      queryBuilder.andWhere('user.role = :role', { role: query.role })
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(LOWER(user.name) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search))',
        { search: `%${query.search}%` }
      )
    }

    const total = await queryBuilder.getCount()

    const users = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany()

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } })

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    return user
  }

  async updateUser(id: string, updateDto: UpdateUserByAdminDto): Promise<User> {
    const user = await this.findUserById(id)

    if (updateDto.email && updateDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateDto.email },
      })

      if (existingUser) {
        throw new ConflictException('Email is already in use')
      }
    }

    Object.assign(user, updateDto)

    return this.userRepository.save(user)
  }

  async updateUserRole(id: string, role: UserRole): Promise<User> {
    const user = await this.findUserById(id)
    user.role = role
    return this.userRepository.save(user)
  }

  async deleteUser(id: string, currentUserId: string): Promise<void> {
    if (id === currentUserId) {
      throw new BadRequestException('Cannot delete your own account')
    }

    const user = await this.findUserById(id)

    await this.userRepository.remove(user)
  }

  async getStats(): Promise<{
    totalUsers: number
    adminCount: number
    userCount: number
    verifiedCount: number
    unverifiedCount: number
  }> {
    const [totalUsers, adminCount, userCount, verifiedCount, unverifiedCount] =
      await Promise.all([
        this.userRepository.count(),
        this.userRepository.count({ where: { role: UserRole.ADMIN } }),
        this.userRepository.count({ where: { role: UserRole.USER } }),
        this.userRepository.count({ where: { emailVerified: true } }),
        this.userRepository.count({ where: { emailVerified: false } }),
      ])

    return {
      totalUsers,
      adminCount,
      userCount,
      verifiedCount,
      unverifiedCount,
    }
  }
}
