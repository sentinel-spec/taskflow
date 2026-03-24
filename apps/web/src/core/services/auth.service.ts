"use client";

import type {
  AuthResponseDto,
  CheckEmailResponseDto,
  LoginDto,
  LogoutResponseDto,
  RegisterDto,
} from "@/core/types/dto/auth.dto";
import { API } from "./api.service";

export class AuthService {
  async checkEmail(email: string): Promise<CheckEmailResponseDto> {
    const response = await API.post<CheckEmailResponseDto>(
      "/auth/check-email",
      {
        email,
      },
    );
    return response.data;
  }

  async login(data: LoginDto): Promise<AuthResponseDto> {
    const response = await API.post<AuthResponseDto>("/auth/login", data);
    return response.data;
  }

  async register(data: RegisterDto): Promise<AuthResponseDto> {
    const response = await API.post<AuthResponseDto>("/auth/register", data);
    return response.data;
  }

  async logout(): Promise<LogoutResponseDto> {
    const response = await API.post<LogoutResponseDto>("/auth/logout");
    return response.data;
  }
}

export const authService = new AuthService();
