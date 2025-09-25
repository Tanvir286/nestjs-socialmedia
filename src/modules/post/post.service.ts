import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { DeleteImageDto } from './dto/delete-image.dto';
import { PaginationQueryDto } from 'src/common/pagination/pagination-query.dto';
import appConfig from 'src/config/app.config';
import { first } from 'rxjs';
import { OffsetPaginationDto, PaginationService } from 'src/common/pagination';

@Injectable()
export class PostService {

  constructor(
    private readonly paginationService: PaginationService,
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /*==============(Create a new post)==============*/
  async create(createPostDto: CreatePostDto,
               userId: number, 
               files: Express.Multer.File[]) {

    // Remove mediaUrls from destructuring here
    const { content, published } = createPostDto; 

    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // upload files to Cloudinary if files are provided
    let mediaUrls: string[] = [];
    if (files && files.length > 0) {
      const uploadResults = await this.cloudinaryService.uploadMultipleFiles(files);
      mediaUrls = uploadResults.map(result => result.secure_url);
    }

    const post = await this.prisma.post.create({
      data: {
        content,
        mediaUrls, 
        published,
        authorId: userId,
      },
    });

    return {
      message: 'Post created successfully',
      post: {
        id: post.id,
        content: post.content,
        mediaUrls: post.mediaUrls,
        published: post.published,
        authorId: post.authorId,
        authorName: existingUser.name,
      },
    };
  }

  /*==============(Get all posts)==============*/
  async findAll(paginationQuery: OffsetPaginationDto) {

    const { page = 1, limit = 10 } = paginationQuery;

    return this.paginationService.paginateOffset(this.prisma, 'post', {
      where: {}, 
      include: { author: true },
      page,
      limit,
      baseUrl: appConfig().baseUrl.url,
      endpoint: '/allpost', // API route
      mapData: (p) => ({
        id: p.id,
        content: p.content,
        mediaUrls: p.mediaUrls,
        published: p.published,
        authorId: p.authorId,
        authorName: p.author.name,
      }),
    });
  }

  /*==============(Get a single post by ID)==============*/
  async findOne(id: number) { 

    const post = await this.prisma.post.findFirst({
      where: { id },
      include: {
          author: true
       },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return {
      message: 'Post retrieved successfully',
      data:{
        id: post.id,
        content: post.content,
        mediaUrls: post.mediaUrls,
        published: post.published,
        authorId: post.authorId,
        authorName: post.author.name, 
      }
    }
  }

  /*==============(Update a post by ID)==============*/
  async update(id: number, 
               updatePostDto: UpdatePostDto, 
               userId: number,
               files: Express.Multer.File[]
              ) {

    console.log(files, "files");


    const post = await this.prisma.post.findFirst({
      where: { id, authorId: userId },
      include: {
          author: true
       },
    });

    if (!post) throw new NotFoundException('Post not found');
    

    // Upload new files if provided
    let newMediaUrls: string[] = [];

    if (files && files.length > 0) {
      const uploadResults = await this.cloudinaryService.uploadMultipleFiles(files);
      console.log(uploadResults,"ji");
      newMediaUrls = uploadResults.map(result => result.secure_url);
    }

    // Merge existing mediaUrls with new ones
    const updateData = { 
      ...updatePostDto, 
      mediaUrls: [...(post.mediaUrls || []), ...newMediaUrls] };

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: updateData,
    });

    return {
      message: 'Post updated successfully',
      data: {
        id: updatedPost.id,
        content: updatedPost.content,
        mediaUrls: updatedPost.mediaUrls,
        published: updatedPost.published,
        authorId: updatedPost.authorId,
        authorName: post.author.name,
      },
    };
  }

  /*==============(Delete an image from a post)==============*/
  async deleteImage(id: number, 
                    deleteImageDto: DeleteImageDto, 
                    userId: number) {

    let { imageUrl } = deleteImageDto;                

    const post = await this.prisma.post.findFirst({
      where: { id, authorId: userId },
      include: {
          author: true
       },
    });

    if (!post) throw new NotFoundException('Post not found');

     
    if (!(post.mediaUrls).includes(imageUrl)) {
      throw new NotFoundException('This image does not exist in the post');
    }

    // Remove the image from the mediaUrls array
    const updatedMediaUrls = post.mediaUrls.filter(url => url !== imageUrl);

    console.log(updatedMediaUrls);

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: { mediaUrls: updatedMediaUrls },
    });

    return {
      message: 'Image deleted successfully',
      data: {
        id: updatedPost.id,
        content: updatedPost.content,
        mediaUrls: updatedPost.mediaUrls,
        published: updatedPost.published,
        authorId: updatedPost.authorId,
        authorName: post.author.name,
      },
    };
  }

  /*==============(Delete a post by ID)==============*/
 
  async remove(id: number, userId: number) {

    const post = await this.prisma.post.findUnique({
      where: {id},
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new NotFoundException('You are not authorized to delete this post');
    }

    await this.prisma.post.delete({
      where: { id },
    });

    return {
      message: 'Post deleted successfully',
    };
  }

  

}
   