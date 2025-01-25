import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId } from 'mongoose';
import { Response, ResponseDocument } from '../Schemas/responses.schema';
import { Quiz, QuizDocument } from '../Schemas/quizzes.schema';
import { QuestionBank, QuestionBankDocument } from '../Schemas/QuestionBank.schema';
import { User, UserDocument } from '../Schemas/users.schema'; 
import { createResponseDto } from './responsesDto/createResponse.dto';
import { updateResponseDto } from './responsesDto/updateResponse.dto';
import { QuizzesService } from 'src/quizzes/quizzes.service';
import { ResponseGateway } from './responses.gateway';
import { Socket } from 'socket.io';

@Injectable()
export class ResponsesService {
  constructor(
    @InjectModel(Response.name) private responseModel: Model<ResponseDocument>,
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
    @InjectModel(QuestionBank.name) private questionBankModel: Model<QuestionBank>,
    @InjectModel(User.name) private userModel: Model<User>, // Add this
    private readonly quizzesService: QuizzesService,
    private readonly responseGateway: ResponseGateway,
  ) {}

  /**
   * Create a new response for a quiz
   */
  async createResponse(responseData: createResponseDto): Promise<Response> {
    const { user_id, quiz_id, answers } = responseData;
    
    const user = await this.userModel.findById(user_id);
    // Fetch the user and their corresponding quiz questions by difficulty
    const quizQuestions: QuestionBankDocument[] = (await this.quizzesService.findByUserId(user_id, quiz_id)) as QuestionBankDocument[];
  
    // Validate Answers and Calculate Score
    let score = 0;
    const validatedAnswers = [];
  
    for (const answer of answers) {
      // Ensure the question is part of the filtered quiz questions
      const question = quizQuestions.find(
        (q) => q._id.toString() === answer.question_id  // _id is now part of the Mongoose document
      );
  
      if (!question) {
        throw new BadRequestException(
          `Invalid or unauthorized question ID: ${answer.question_id}`
        );
      }
  
      // Check if the user's answer is correct
      const isCorrect = question.correct_answer === answer.user_answer;
      if (isCorrect) score++;
  
      // Push validated answer with correctness and the correct answer
      validatedAnswers.push({
        question_id: question._id,
        user_answer: answer.user_answer,
        correct_answer: question.correct_answer, // Store the correct answer
      });
      this.responseGateway.sendGpaUpdate(user_id.toString(), user.gpa);
    }
  
    // Generate the message based on the user's performance
    const totalQuestions = quizQuestions.length;
    let message = '';
    if (score >= totalQuestions * 0.75) {
      message = 'GREAT JOB';
    } else if (score >= totalQuestions / 2) {
      message = 'Good work but needs improvement';
    } else {
      message = `You need to revise the module. Your score: ${score} / ${totalQuestions}`;
    }
  
    const normalizedScore = score / totalQuestions;
  
    // Update the user's GPA
    await this.updateUserGPA(user_id.toString(), normalizedScore);
    
    // Convert score to percentage
    score = score * 100 / totalQuestions;
    // Create the Response document
    const newResponse = new this.responseModel({
      user_id,
      quiz_id,
      answers: validatedAnswers,
      score,
      submitted_at: new Date(),
      message,
    });
  
    return await newResponse.save();
  }

  private async updateUserGPA(userId: string, normalizedScore: number): Promise<void> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const currentGPA = user.gpa || 0;
      const gpaImpact = (normalizedScore - 0.5) * 2;
      const newGPA = Math.max(0, Math.min(4.0, currentGPA + gpaImpact));

      user.gpa = newGPA;
      await user.save();

      // Emit the GPA update through the websocket
      this.responseGateway.sendGpaUpdate(userId, newGPA);
    } catch (error) {
      console.error('Error updating GPA:', error);
      throw error;
    }
  }
  
  /**
   * Retrieve a response by ID
   */
  async findResponseById(id: string): Promise<Response> {
    const response = await this.responseModel.findById(id).populate(['quiz_id', 'answers.question_id']);
    if (!response) {
      throw new NotFoundException(`Response with ID ${id} not found`);
    }
    return response;
  }

  /**
   * Retrieve all responses for a specific quiz
   */
  async findResponsesByQuiz(quiz_id: string): Promise<Response[]> {
    const responses = await this.responseModel.find({ quiz_id });
    if (responses.length === 0) {
      throw new NotFoundException(`No responses found for Quiz ID ${quiz_id}`);
    }
    return responses;
  }

  /**
   * Retrieve all responses for a specific user
   */
  async findResponsesByUser(user_id: string): Promise<Response[]> {
    ;
    const responses = await this.responseModel.find({ user_id }).populate('quiz_id');
    if (responses.length === 0) {
      throw new NotFoundException(`No responses found for User ID ${user_id}`);
    }
    return responses;
  }
  
}
