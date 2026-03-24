"use client";

import type { UpdateMeDto, UserDto } from "@/core/types/dto/user.dto";
import { API } from "./api.service";

export class UserService {
  async getMe(): Promise<UserDto> {
    const response = await API.get<UserDto>("/user/me");
    return response.data;
  }

  async updateMe(data: UpdateMeDto): Promise<UserDto> {
    const response = await API.patch<UserDto>("/user/me", data);
    return response.data;
  }
}

export const userService = new UserService();
