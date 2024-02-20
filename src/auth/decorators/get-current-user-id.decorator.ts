import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const getCurrentUserId = createParamDecorator(
  (data: string, context: ExecutionContext): number => {
    
    const request = context.switchToHttp().getRequest();
    console.log(request)
    return request.user['sub'];
  },
);
