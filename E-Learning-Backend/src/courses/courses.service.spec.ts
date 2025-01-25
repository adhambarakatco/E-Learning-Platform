
import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from '../Schemas/courses.schema';
import { VersioningService } from './versioning/versioning.service';


describe('CoursesService', () => {
  let service: CoursesService;
  let courseModel: Model<Course>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        VersioningService,
      {
        provide: getModelToken('Course'),//Providing the course model token
        useValue: {
          Model,//Mocking the Model class
          new: jest.fn(),//Mocking the new method
          constructor: jest.fn(),
          find: jest.fn(),
          findById: jest.fn(),
          create: jest.fn(),
          save: jest.fn(),
        },
      }],
    }).compile();

    //Getting the instance of the service
    service = module.get<CoursesService>(CoursesService);
    //Getting the instance of the course model
    courseModel = module.get<Model<Course>>(getModelToken('Course'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined(); //Ensuring the service is defined
  });
});
