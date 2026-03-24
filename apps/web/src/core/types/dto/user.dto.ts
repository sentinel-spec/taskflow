export interface UserDto {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role?: string;
  roles?: string[];
}

export interface UpdateMeDto {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role?: string;
}
