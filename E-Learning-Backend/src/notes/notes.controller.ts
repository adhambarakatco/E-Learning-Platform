import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Put } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { AutoSaveDto } from './dto/autosave-note.dto';
import { AuthGuard } from 'src/auth/auth.guard';
@UseGuards(AuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@Body() createNoteDto: CreateNoteDto) {
    return this.notesService.create(createNoteDto);
  }

  @Get(':studentId/:moduleId')
  findAll(@Param('studentId') studentId: string, @Param('moduleId') moduleId: string) {
    return this.notesService.findAll(studentId, moduleId);
  }
  @Get(':noteId')
  findOne(@Param('noteId') noteId: string) {
    return this.notesService.findOne(noteId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto) {
    return this.notesService.update(id, updateNoteDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.notesService.delete(id);
  }

  @Patch(':id')
  autosave(@Param('id') id: string, @Body() AutoSaveDto: AutoSaveDto) {
    return this.notesService.autosave(id, AutoSaveDto);
  }
}