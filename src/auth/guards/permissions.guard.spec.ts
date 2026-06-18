import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const createMockContext = (permissions?: string[]): ExecutionContext => {
    const req = { user: permissions ? { permissions } : undefined };
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

  it('should allow access if no permissions are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const context = createMockContext(['read:products']);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has all required permissions', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['read:products', 'write:products']);

    const context = createMockContext(['read:products', 'write:products', 'delete:products']);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user is missing at least one permission', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['read:products', 'write:products']);

    const context = createMockContext(['read:products']);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user has no permissions', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['read:products']);

    const context = createMockContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
