import { Injectable } from '@nestjs/common';
import { PrismaService } from '@org/data-access';
import { User } from './interfaces/user.type';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true },
    });
  }
}
