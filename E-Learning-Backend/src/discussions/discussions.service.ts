import { HttpException, HttpStatus, Injectable} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Post, PostDocument } from './schemas/post.Schema';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Course, CourseDocument } from 'src/Schemas/courses.schema';
import { User, UserDocument } from 'src/Schemas/users.schema';
import { ValidateIdDto } from './dto/validate-id-dto';

//NOTE: ASK ABOUT DB VALIDATION IMPLEMENTATION

@Injectable()
export class DiscussionsService {
    constructor(
        @InjectModel(Post.name) private postModel: Model<PostDocument>,
        @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
        
        //FOR VALIDATION
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>

    ) {}

    //POSTS

    // Create a new post
    async createPost(createPostDto: CreatePostDto): Promise<PostDocument> {
        const createdPost = new this.postModel(createPostDto);
        await createdPost.save();
        return createdPost.populate('author', '_id name role');
        console.log(createdPost.author._id)

    }

    // Get all posts for a specific course
    async getPostsByCourse(courseId: string): Promise<{ message: string, data: PostDocument[] }> {
        const posts = await this.postModel.find({ course: courseId })
        .sort({ createdAt: -1 })
        .populate('author', '_id name role') // Populate the author field with id, name, and role
        .exec();

        if (posts.length === 0) 
            return { message: 'No posts found for this course', data: [] };

        return { message: 'Posts found', data: posts };
    }

    // DELETE POST ( 3 IMPLEMENTATIONS FOR THE 3 DIFFERENT ROLES)

    //(MAMDO) SHOULD USE GUARDS TO CHECK IF THE USER IS AUTHORIZED TO USE THE CORRECT DELETE METHOD

    ////////////////////////////////////////////////////////////////////////////////////

    // Admin
    async deletePostAdmin(postId: string): Promise<PostDocument> {
        await this.commentModel.deleteMany({ post: postId }).exec(); // Delete related comments
        return this.postModel.findByIdAndDelete(postId);
    }

    // Instructor
    async deletePostInstructor(postId: string, instructorId: string): Promise<PostDocument> {
        const post = await this.postModel.findById(postId).populate('course').exec();

        // Checks if the ID entered is the ID of the course instructor
        if (post.course.userId.toString() == instructorId) {
            await this.commentModel.deleteMany({ post: postId }).exec(); // Delete related comments
            return this.postModel.findByIdAndDelete(postId);
        }
        throw new Error('Unauthorized: Instructors can only delete posts within their own course'); 
    }

    // Student
    async deletePostStudent(postId: string, studentId: string): Promise<PostDocument> {
        const post = await this.postModel.findById(postId);

        // Checks if the ID entered is the ID of the student who created the post
        if (post.author._id.toString() == studentId) {

            await this.commentModel.deleteMany({ post: postId }).exec(); 
            return this.postModel.findByIdAndDelete(postId);

        }
        throw new Error('Unauthorized: Students can only delete their own posts'); 
    }

    ////////////////////////////////////////////////////////////////////////////////////


    //COMMENTS

    // Create a new comment
    async createComment(createCommentDto: CreateCommentDto): Promise<CommentDocument> {
        const createdComment = new this.commentModel(createCommentDto);
        await createdComment.save();
        return createdComment.populate('author', '_id name role'); // Populate the author field with id, name, and role
    }

    // Get all comments for a specific post
    async getCommentsByPost(postId: string): Promise<{ message: string, data: CommentDocument[] }> {
        
        const comments = await this.commentModel.find({ post: postId })
        .sort({ createdAt: -1 })
        .populate('author', '_id name role') // Populate the author field with id, name, and role
        .exec();


        if (comments.length === 0) 
            return { message: 'No comments found for this post', data: [] };

        return { message: 'Comments found', data: comments };
    }

    // DELETE COMMENT ( 3 IMPLEMENTATIONS FOR THE 3 DIFFERENT ROLES)
    // (MAMDO) SHOULD USE GUARDS TO CHECK IF THE USER IS AUTHORIZED TO USE THE CORRECT DELETE METHOD
    ////////////////////////////////////////////////////////////////////////////////////

     // Admin
     async deleteCommentAdmin(commentId: string): Promise<CommentDocument> {
        return this.commentModel.findByIdAndDelete(commentId);
    }

    // Instructor
    async deleteCommentInstructor(commentId: string, instructorId: string): Promise<CommentDocument> {
        const comment = await this.commentModel.findById(commentId);
        const post = await this.postModel.findById(comment.post).populate('course').exec();
         
        if (post.course.userId.toString() === instructorId) {
            return this.commentModel.findByIdAndDelete(commentId);
        }
        throw new Error('Unauthorized: Instructors can only delete comments within their own course');
    }

    // Student
    async deleteCommentStudent(commentId: string, studentId: string): Promise<CommentDocument> {
        const comment = await this.commentModel.findById(commentId);

        if (comment.author._id.toString() === studentId) {
            return this.commentModel.findByIdAndDelete(commentId);
        }
        throw new Error('Unauthorized: Students can only delete their own comments');
    }

    ////////////////////////////////////////////////////////////////////////////////////

    // METHODS FOR NOTIFICATIONS 

    // Get post to handle notifications based on post replies
    async getPostById(postId: string): Promise<PostDocument> {
        return this.postModel.findById(postId);
    }

    // METHODS FOR SEARCH FUNCTIONALITY

    // Search for enrolled coures to access the discussion forum for it
    async searchEnrolledCourses(query: string): Promise<CourseDocument[]> {
        return this.courseModel.find({ name: { $regex: query, $options: 'i' } }).exec();
    }

    // Search for post within a discussion forum

    // Search for posts by title
    async searchPostsTitle(query: string): Promise<PostDocument[]> {
        return this.postModel.find({ title: { $regex: query, $options: 'i' } }).exec();
    }

    // Search for posts by content
    async searchPostsContent(query: string): Promise<PostDocument[]> {
        return this.postModel.find({ content: { $regex: query, $options: 'i' } }).exec();
    }



}
