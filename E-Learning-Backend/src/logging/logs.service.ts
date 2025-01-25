import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log, LogType } from '../Schemas/logs.schema';

@Injectable()
export class LogsService {
    constructor(
        @InjectModel(Log.name) private logModel: Model<Log>
    ) {}

    async logFailedLogin(email: string) {
        const log = new this.logModel({
            type: LogType.FAILED_LOGIN,
            email,
            message: `Failed login attempt for email: ${email}`
        });
        await log.save();
    }

    async logUnauthorizedAccess(endpoint: string, message: string, email?: string) {
        const log = new this.logModel({
            type: LogType.UNAUTHORIZED_ACCESS,
            endpoint,
            message,
            email
        });
        await log.save();
    }

    async getLogs(query: any = {}, skip: number = 0, limit: number = 10) {
        return this.logModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    }

    async getLogsCount(query: any = {}) {
        return this.logModel.countDocuments(query).exec();
    }
} 