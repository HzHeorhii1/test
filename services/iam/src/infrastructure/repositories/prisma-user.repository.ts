import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../domain/aggregates/user/user.aggregate';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { IamPrismaService } from '../database/iam-prisma.service';

function isPrismaError(err: unknown, code: string): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === code
  );
}

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: IamPrismaService) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.db.user.findUnique({ where: { id } });
    return row ? User.reconstitute(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.db.user.findUnique({ where: { email } });
    return row ? User.reconstitute(row) : null;
  }

  async save(user: User): Promise<void> {
    try {
      await this.prisma.db.user.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          email: user.email,
          password: user.passwordHash,
          roles: user.roles,
        },
        update: {
          email: user.email,
          password: user.passwordHash,
          roles: user.roles,
        },
      });
    } catch (err) {
      if (isPrismaError(err, 'P2002')) throw new ConflictException('Email already in use');
      throw err;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.db.user.delete({ where: { id } });
    } catch (err) {
      if (isPrismaError(err, 'P2025')) throw new NotFoundException(`User not found: ${id}`);
      throw err;
    }
  }
}
