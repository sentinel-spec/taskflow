"use client";

import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add auth token
API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor to handle errors (e.g., 401 Unauthorized)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Do not force hard redirects from interceptor.
    // Let screen-level auth logic decide navigation to avoid redirect loops.
    return Promise.reject(error);
  },
);
