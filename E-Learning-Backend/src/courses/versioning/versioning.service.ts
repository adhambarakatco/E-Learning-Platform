import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from '../../Schemas/courses.schema';

@Injectable()
export class VersioningService {
  constructor(@InjectModel('Course') private readonly courseModel: Model<Course>) {}

  // Saving a copy of the existing course as a new document with 'isArchived' set to true
  async savePreviousVersion(courseId: string, data: any): Promise<any> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    const previousVersion = new this.courseModel({
      ...course.toObject(),
      _id: undefined,
      isArchived: true,
      updated_at: new Date(),
    });
    await previousVersion.save();
  }

  //Updating a specific version for a course
   async updateVersion(courseId: string, data: any): Promise<any> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
   }
   
   //Deleting a specific version for a course
   async deleteVersion(courseId: string, versionNumber: number): Promise<any> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
   }

  //Retrieving a specific version for a course
  async getVersion(courseId: string, versionNumber: number): Promise<any> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    return course?.versions?.find(v => v.versionNumber === versionNumber);
  }

  // Creating a new version for a course
  async createVersion(courseId: string, data: any): Promise<any> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Create new version with timestamp
    const version = {
      ...data,
      versionNumber: (course.versions?.length || 0) + 1,
      createdAt: new Date(),
    };

    // Add version to versions array
    await this.courseModel.findByIdAndUpdate(
      courseId,
      { $push: { versions: version } },
      { new: true },
    ).exec();
    
    return version;
  }

  // Retrieving all versions for a course
  async getVersions(courseId: string): Promise<any[]> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    return course?.versions || [];
  }

  // Retrieving a specific version for a course
  async getSpecificVersion(courseId: string, versionNumber: number): Promise<any> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    const version = course.versions.find(v => v.versionNumber === Number(versionNumber));
    if (!version) {
      throw new NotFoundException(`Version number "${versionNumber}" not found for course ID "${courseId}"`);
    }
    return version;
  }
}
