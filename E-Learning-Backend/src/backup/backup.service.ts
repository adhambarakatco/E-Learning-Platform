import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
const execPromise = promisify(exec);
@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private backupDir: string;

  constructor() {
    this.backupDir = path.join(process.cwd(), 'AlpineAcademy_backup');
    this.ensureBackupDirectory();
  }

  private ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  @Cron('5 13 * * *') // Backs up at 12 AM daily
  private async createBackup() {
    try {
      const outputDir = path.join(this.backupDir, `AlpineAcademy_backup_${new Date().toISOString().replace(/[:.]/g, '-')}`);
      const mongoUri = "mongodb://127.0.0.1:27017/e-learning_db";

      if (!mongoUri) {
        throw new Error('Invalid mongo URI');
      }

      // mongodump --uri=mongodb://127.0.0.1:27017/e-learning_db --out=./test
      const command = `mongodump --uri="${mongoUri}" --out="${outputDir}"`;

      const { stdout, stderr } = await execPromise(command);

      if (stderr) {
        this.logger.warn(`Backup completed with warnings: ${stderr}`);
      } else {
        this.logger.log(`Successful backup!: ${stdout}`);
      }
    } catch (error) {
      this.logger.error(`Backup failed: ${error.message}`);
    }
  }
}