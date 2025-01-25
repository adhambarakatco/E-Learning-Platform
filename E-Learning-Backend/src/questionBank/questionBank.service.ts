import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { QuestionBank, QuestionBankDocument } from '../Schemas/QuestionBank.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Module } from 'src/Schemas/modules.schema';
import { createQuestionsDTo } from './questionDto/createQuestionDto.dto';
import { updateQuestionsDTo } from './questionDto/updateQuestionDto.dto';
@Injectable()
export class QuestionBankService {
  constructor(
    @InjectModel(QuestionBank.name) private questionBankModel: Model<QuestionBankDocument>,
    @InjectModel(Module.name) private moduleModel: Model<Module>

  ) {}

  // Create a question
  async createQuestion(questionData: createQuestionsDTo): Promise<QuestionBank> {
    const { type, options, correct_answer,module_id, difficulty, question_text } = questionData;

    const module = await this.moduleModel.findById(module_id);
    if (!module) {
      throw new NotFoundException(`Module with ID ${module_id} not found`);
    }
    if (!['A', 'B', 'C'].includes(difficulty)) {
      throw new BadRequestException(
        'The difficulty must be "A" for Hard, "B" for Normal, or "C" for Easy',
      );
    }

    if(question_text === ""){
      throw new BadRequestException(
        'You need to write the question',
      ); 
    }

    // Handle options and validation
    if (type === 'True/False') {
      questionData.options = ['True', 'False']; // Automatically set options
    } else if (type === 'MCQ') {
      if (!options || options.length < 3 || options.length > 4) {
        throw new BadRequestException(
          `MCQ questions must have between 3 and 4 options. Received ${options?.length || 0}.`,
        );
      }
    }else{
      throw new BadRequestException(
        `The type must be MCQ or True/False.`,
      );
    }

    // Validate correct answer
    if (!questionData.options.includes(correct_answer)) {
      throw new BadRequestException(
        `The correct answer must match one of the provided options.`,
      );
    }

    // Save the question to the database
    const newQuestion = new this.questionBankModel(questionData);
    const question = await newQuestion.save();
    return question;
  }

  async findById(id: string): Promise<QuestionBank> {
    const question = await this.questionBankModel.findById(id);
    
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return question;
  }

  async findQuestionsByModuleId(module_id: string): Promise<QuestionBank[]> {
    // Validate the provided module ID
    if (!mongoose.Types.ObjectId.isValid(module_id)) {
      throw new BadRequestException(`Invalid module ID: ${module_id}`);
    }
  
    // Find all questions related to the module
    const questions = await this.questionBankModel.find({ module_id });
  
    if (!questions || questions.length === 0) {
      throw new NotFoundException(`No questions found for module ID: ${module_id}`);
    }
  
    return questions;
  }
  

  async findAll(): Promise<QuestionBank[]> {
    let questions= await this.questionBankModel.find();  // Fetch all students from the database
    return questions;
}

  // Update a question
  async updateQuestion(id: string, updateData: updateQuestionsDTo): Promise<QuestionBank> {
    const { type, options, correct_answer,question_text } = updateData;

    if(question_text === ""){
      throw new BadRequestException(
        'You need to write the question',
      ); 
    }

    // Handle options and validation
    if (type === 'True/False') {
      updateData.options = ['True', 'False']; // Automatically set options
    } else if (type === 'MCQ') {
      if (options && (options.length < 3 || options.length > 4)) {
        throw new BadRequestException(
          `MCQ questions must have between 3 and 4 options. Received ${options?.length || 0}.`,
        );
      }
    }

    if (updateData.module_id) {
      const module = await this.moduleModel.findById(updateData.module_id);
      if (!module) {
        throw new NotFoundException(`Module with ID ${updateData.module_id} not found`);
      }
      updateData.module_id = module._id.toString(); 

    }

    // Validate correct answer
    if (correct_answer && !updateData.options.includes(correct_answer)) {
      throw new BadRequestException(
        `The correct answer must match one of the provided options.`,
      );
    }

    // Update the question in the database
    return await this.questionBankModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  // Delete a question by ID
  async delete(id: string): Promise<QuestionBank> {
    return await this.questionBankModel.findByIdAndDelete(id);  // Find and delete the question
}
}


