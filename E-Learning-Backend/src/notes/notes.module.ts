import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { Note, NoteSchema } from '../Schemas/notes.schema';
import { LogsModule } from 'src/logging/logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }]),LogsModule
  ],
  controllers: [NotesController],
  providers: [NotesService]
})
export class NotesModule {}
