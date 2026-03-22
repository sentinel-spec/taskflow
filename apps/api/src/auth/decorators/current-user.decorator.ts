import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface RequestWithUser {
  user: UserPayload;
}

export interface UserPayload {
  id: number;
  email: string;
  roles: string[];
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
