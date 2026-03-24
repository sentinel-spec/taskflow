import type { UserDto } from "./user.dto";

export interface CheckEmailDto {
  email: string;
}

export interface CheckEmailResponseDto {
  exists: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  access_token: string;
  refresh_token: string;
  user: UserDto;
}

export interface LogoutResponseDto {
  success?: boolean;
  message?: string;
}
