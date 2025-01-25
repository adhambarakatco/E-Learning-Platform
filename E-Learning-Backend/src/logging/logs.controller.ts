import { Controller, Get, UseGuards } from '@nestjs/common';
import { LogsService } from './logs.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../role/role.guard';
import { Roles } from '../role/role.decorator';
import { Role } from '../Schemas/users.schema';

@Controller('logs')
@UseGuards(AuthGuard, RolesGuard)
export class LogsController {
    constructor(private readonly logsService: LogsService) {}

    @Get()
    @Roles(Role.Admin)
    async getLogs() {
        return this.logsService.getLogs();
    }
} 