import { cookies } from "next/headers";
import { logger } from "@/core/lib/logger";

export interface IUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  roles?: string[];
}

export async function getServerSideUser(): Promise<IUser | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return null;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/user/me`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    logger.error("Failed to get server side user", error);
    return null;
  }
}
