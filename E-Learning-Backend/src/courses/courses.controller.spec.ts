
import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { getModelToken } from '@nestjs/mongoose';
import { VersioningService } from './versioning/versioning.service';

describe('CoursesController', () => {
  let controller: CoursesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],//Providing the controller dependencies to be tested
      providers: [
        CoursesService,
        {
          provide: getModelToken('Course'), // Mocking the Course model
          useValue: {}, // Use an empty object or a mock implementation for the model methods
        },
        {
          provide: VersioningService, // Mocking the VersioningService
          useValue: { savePreviousVersion: jest.fn() }, // Mock implementation of the versioning methods
        },
      ],
    }).compile();
    //Getting the instance of the controller
    controller = module.get<CoursesController>(CoursesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined(); //Ensuring the controller is defined
  });
});