"use client";

import { isAxiosError } from "axios";
import { action, makeObservable, observable, runInAction } from "mobx";
import { toAppError } from "@/core/lib/api-error-handler";
import type { LoginDto, RegisterDto } from "@/core/types/dto/auth.dto";
import type { UpdateMeDto, UserDto } from "@/core/types/dto/user.dto";
import { authService } from "../../services/auth.service";
import { userService } from "../../services/user.service";
import type { ICoreRootStore } from "../root.store";
export type IUser = UserDto;

export class UserStore {
  currentUser: IUser | null = null;
  isLoading: boolean = false;
  isLoggedIn: boolean = false;

  constructor(public readonly rootStore?: ICoreRootStore) {
    makeObservable(this, {
      currentUser: observable,
      isLoading: observable,
      isLoggedIn: observable,
      setUserData: action,
      login: action,
      register: action,
      logout: action,
      fetchCurrentUser: action,
      checkEmail: action,
    });

    // Check for token on init
    if (typeof window !== "undefined" && localStorage.getItem("access_token")) {
      this.isLoggedIn = true;
    }
  }

  setUserData(user: IUser | null) {
    this.currentUser = user;
    this.isLoggedIn = !!user;
  }

  async checkEmail(email: string) {
    try {
      return await authService.checkEmail(email);
    } catch (error) {
      throw toAppError(error, {
        defaultMessage: "Failed to check email. Please try again.",
      });
    }
  }

  async login(data: LoginDto) {
    this.isLoading = true;
    try {
      const response = await authService.login(data);
      runInAction(() => {
        localStorage.setItem("access_token", response.access_token);
        localStorage.setItem("refresh_token", response.refresh_token);
        this.setUserData(response.user);
        this.isLoading = false;
      });
      return response;
    } catch (error) {
      runInAction(() => {
        this.isLoading = false;
      });
      throw toAppError(error, {
        defaultMessage: "Failed to sign in. Please check your credentials.",
      });
    }
  }

  async register(data: RegisterDto) {
    this.isLoading = true;
    try {
      const response = await authService.register(data);
      runInAction(() => {
        localStorage.setItem("access_token", response.access_token);
        localStorage.setItem("refresh_token", response.refresh_token);
        this.setUserData(response.user);
        this.isLoading = false;
      });
      return response;
    } catch (error) {
      runInAction(() => {
        this.isLoading = false;
      });
      throw toAppError(error, {
        defaultMessage: "Failed to create account. Please try again.",
      });
    }
  }

  async logout() {
    try {
      await authService.logout();
    } finally {
      runInAction(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        this.setUserData(null);
      });
    }
  }

  async fetchCurrentUser() {
    if (!this.isLoggedIn) return;
    this.isLoading = true;
    try {
      const user = await userService.getMe();
      runInAction(() => {
        this.setUserData(user);
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.isLoading = false;
        // Only invalidate auth state on explicit unauthorized response.
        // For transient network/server errors keep current session state.
        if (isAxiosError(error) && error.response?.status === 401) {
          this.isLoggedIn = false;
        }
      });
    }
  }

  async updateMe(data: UpdateMeDto) {
    try {
      const user = await userService.updateMe(data);
      runInAction(() => {
        this.setUserData(user);
      });
      return user;
    } catch (error) {
      throw toAppError(error, {
        defaultMessage: "Failed to update profile. Please try again.",
      });
    }
  }
}
