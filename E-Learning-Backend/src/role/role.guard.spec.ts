import { RolesGuard } from './role.guard';
import { Reflector } from '@nestjs/core';
import { LogsService } from '../logging/logs.service';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;
  let logsService: LogsService;

  beforeEach(() => {
    reflector = new Reflector();
    logsService = {
      logUnauthorizedAccess: jest.fn(),
    } as any;
    
    guard = new RolesGuard(reflector, logsService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

});
