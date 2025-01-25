import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, HydratedDocument, ObjectId, Types } from 'mongoose';
import { Quiz, QuizDocument, QuizSchema } from '../Schemas/quizzes.schema';
import { Module } from '../Schemas/modules.schema';
import { QuestionBank } from '../Schemas/QuestionBank.schema';
import { updateQuizzesDTo } from './quizzesDto/updateQuizzes.dto';
import { createQuizzesDTo } from './quizzesDto/createQuizzes.dto';
import { User } from 'src/Schemas/users.schema';


@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>, // Use `Quiz.name`
    @InjectModel(Module.name) private moduleModel: Model<Module>,
    @InjectModel(QuestionBank.name) private questionBankModel: Model<QuestionBank>,
    @InjectModel(User.name) private userModel: Model<User>,
  ){;
    ; }

  // Create a new quiz
  async create(QuizData: createQuizzesDTo): Promise<Quiz> {
    const { module_id, typeOfQuestions, numOfQuestions } = QuizData;

    // Ensure that the provided module_id exists
    const module = await this.moduleModel.findById(module_id);
    if (!module) {
      throw new NotFoundException(`Module with ID ${module_id} not found`);
    }

    const existingQuiz = await this.quizModel.findOne({ module_id });
    if (existingQuiz) {
      throw new BadRequestException(
        `A quiz already exists for the module "${module.title}". Only one quiz is allowed per module.`
      );
    }

    // Fetch random questions for each difficulty level, ensuring each array contains exactly `numOfQuestions`
    const questionsA = await this.getRandomQuestions(module_id, typeOfQuestions, numOfQuestions, 'A');
    const questionsB = await this.getRandomQuestions(module_id, typeOfQuestions, numOfQuestions, 'B');
    const questionsC = await this.getRandomQuestions(module_id, typeOfQuestions, numOfQuestions, 'C');

    // Create the quiz document
    const newQuiz = new this.quizModel({
      module_id,
      questionsA,
      questionsB,
      questionsC,
      numOfQuestions,
      typeOfQuestions,
      created_at: new Date(),
    });

    // Save the quiz
    return await newQuiz.save();
  }

  // Helper method to fetch random questions by difficulty
  private async getRandomQuestions(
    module_id: string,
    typeOfQuestions: string[],
    numOfQuestions: number,
    difficulty: string
  ): Promise<mongoose.Types.ObjectId[]> {
    const matchCriteria: any = {
      module_id: new mongoose.Types.ObjectId(module_id),
      difficulty,
    };
    if (typeOfQuestions?.length > 0) {
      matchCriteria.type = { $in: typeOfQuestions };
    }

    const questionDocs = await this.questionBankModel.aggregate([
      { $match: matchCriteria },
      { $sample: { size: numOfQuestions } },
    ]);

    if (questionDocs.length < numOfQuestions) {
      throw new BadRequestException(
        `Not enough questions available for difficulty "${difficulty}" (${questionDocs.length} found, ${numOfQuestions} needed).`
      );
    }

    return questionDocs.map((q) => q._id);
  }
  

  
  // private async validateQuestionIds(
  //   questions: mongoose.Types.ObjectId[]
  // ): Promise<mongoose.Types.ObjectId[]> {
  //   const questionDocs = await this.questionBankModel.find({ _id: { $in: questions } });
  
  //   if (questionDocs.length !== questions.length) {
  //     throw new BadRequestException(
  //       'One or more provided question IDs are invalid or do not exist.'
  //     );
  //   }
  
  //   return questionDocs.map((q) => q._id);
  // }

  async findByQuizId(quiz_id:string): Promise<Quiz>{
    const quiz = await this.quizModel.findById(quiz_id);

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quiz_id} not found`);
    }

    return quiz;
  }
  

  async findByUserId(user_id: ObjectId, quiz_id: string): Promise<QuestionBank[]> {
    // Fetch the user
    console.log(user_id);
    console.log(quiz_id);
    const user = await this.userModel.findById(user_id);
    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    // Fetch the quiz and populate the question fields
    const quiz = await this.quizModel
      .findById(quiz_id)
      .populate<{ questionsA: QuestionBank[]; questionsB: QuestionBank[]; questionsC: QuestionBank[] }>([
        { path: 'questionsA' },
        { path: 'questionsB' },
        { path: 'questionsC' },
      ]);

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quiz_id} not found`);
    }

    // Determine the appropriate question set based on user GPA
    let selectedQuestions: QuestionBank[];
    if (user.gpa >= 3.0) {
      selectedQuestions = quiz.questionsA;
    } else if (user.gpa >= 2.0) {
      selectedQuestions = quiz.questionsB;
    } else {
      selectedQuestions = quiz.questionsC;
    }

    if (selectedQuestions.length !== quiz.numOfQuestions) {
      throw new BadRequestException(
        `The selected questions do not match the required count of ${quiz.numOfQuestions}.`
      );
    }

    return selectedQuestions;
  }
  
  
  
  
  
  
  // Get all quizzes
  async findAll(): Promise<Quiz[]> {
    let quizzes= await this.quizModel.find();  // Fetch all students from the database
    return quizzes
}

  // Update a quiz by ID
  async update(quizId: string, updateQuizData: updateQuizzesDTo): Promise<Quiz> {
    const { module_id, typeOfQuestions, numOfQuestions } = updateQuizData;

    // Find the quiz by ID
    const existingQuiz = await this.quizModel.findById(quizId);
    if (!existingQuiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    // Prevent module change
    if (module_id && module_id !== existingQuiz.module_id.toString()) {
      throw new BadRequestException(
        `The module for this quiz cannot be changed. Delete the quiz and create a new one for a different module.`
      );
    }

    // Update questions for each difficulty if criteria are provided
    if (typeOfQuestions || numOfQuestions) {
      existingQuiz.questionsA = await this.getRandomQuestions(
        module_id || existingQuiz.module_id.toString(),
        typeOfQuestions || existingQuiz.typeOfQuestions,
        numOfQuestions || existingQuiz.numOfQuestions,
        'A'
      );

      existingQuiz.questionsB = await this.getRandomQuestions(
        module_id || existingQuiz.module_id.toString(),
        typeOfQuestions || existingQuiz.typeOfQuestions,
        numOfQuestions || existingQuiz.numOfQuestions,
        'B'
      );

      existingQuiz.questionsC = await this.getRandomQuestions(
        module_id || existingQuiz.module_id.toString(),
        typeOfQuestions || existingQuiz.typeOfQuestions,
        numOfQuestions || existingQuiz.numOfQuestions,
        'C'
      );
    }

    // Update other fields
    if (typeOfQuestions) existingQuiz.typeOfQuestions = typeOfQuestions;
    if (numOfQuestions) existingQuiz.numOfQuestions = numOfQuestions;

    // Save the updated quiz
    await existingQuiz.save();
    return existingQuiz;
  }


  async findByModuleId(module_id: string): Promise<Quiz> {
    // Find the quiz associated with the given module_id
    const quiz = await this.quizModel.findOne({ module_id }).populate([
      { path: 'questionsA', model: 'QuestionBank' },
      { path: 'questionsB', model: 'QuestionBank' },
      { path: 'questionsC', model: 'QuestionBank' },
    ]);
  
    if (!quiz) {
      throw new NotFoundException(`No quiz found for module ID: ${module_id}`);
    }
  
    return quiz;
  }
  

  // Delete a quiz by ID
  async delete(id: string): Promise<Quiz> {
    return await this.quizModel.findByIdAndDelete(id);  // Find and delete the student
}
}
