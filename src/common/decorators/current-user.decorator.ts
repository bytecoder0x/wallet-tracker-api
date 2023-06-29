import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type AuthUser = {
  id: number;
  email: string;
};

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
