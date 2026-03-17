import { Exclude, Expose } from 'class-transformer';
import { Role } from '@prisma/client';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  firstName?: string;

  @Expose()
  lastName?: string;

  @Expose()
  isActive: boolean;

  @Expose()
  isVerified: boolean;

  @Expose()
  avatarUrl?: string;

  @Expose()
  roles: Role[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
