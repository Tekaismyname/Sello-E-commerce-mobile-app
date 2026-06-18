import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminLevelGuard } from './admin-level.guard';

describe('AdminLevelGuard', () => {
  let guard: AdminLevelGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminLevelGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AdminLevelGuard>(AdminLevelGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const createMockContext = (role?: string, adminLevel?: number): ExecutionContext => {
    const req = { user: role ? { role, adminLevel } : undefined };
    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if no admin levels are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const context = createMockContext('admin', 1);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user is admin and has matching level', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([1, 2]);

    const context = createMockContext('admin', 2);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user role is not admin', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([1]);

    const context = createMockContext('customer', 1);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user role is admin but has wrong level', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([1]);

    const context = createMockContext('admin', 2);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user is not authenticated', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([1]);

    const context = createMockContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
