import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, PERMISSIONS_KEY, PUBLIC_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      return false;
    }

    // Check roles
    if (requiredRoles) {
      const hasRole = requiredRoles.some((role) => user.role?.name === role);
      if (!hasRole) {
        return false;
      }
    }

    // Check permissions (this would be expanded based on your permission system)
    if (requiredPermissions) {
      // Implement permission checking logic here
      // For now, we'll assume admin has all permissions
      if (user.role?.name === 'Administrator') {
        return true;
      }
      
      // Add more sophisticated permission checking here
      return false;
    }

    return true;
  }
}