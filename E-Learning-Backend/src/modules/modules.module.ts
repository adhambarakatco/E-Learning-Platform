import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModulesController } from './modules.controller';
import { ConfigModule } from '@nestjs/config';
import { ModulesService } from './modules.service';
import { ModuleSchema } from '../Schemas/modules.schema';
import { LogsModule } from 'src/logging/logs.module';


@Module({
  imports: [ConfigModule.forRoot(), MongooseModule.forFeature([{ name: 'Module', schema: ModuleSchema}, ]), LogsModule],
  controllers: [ModulesController],
  providers: [ModulesService],
  exports: [ModulesService]
})
export class ModulesModule {}
