import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostService {

  constructor(private readonly prisma: PrismaService) {}

  /*==============(Create a new post)==============*/
  async create(createPostDto: CreatePostDto, userId: number) {

    const { content, mediaUrls, published } = createPostDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
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
  async findAll() { 
    const posts = await this.prisma.post.findMany({ 
      include: {
          author: true
      }
    });

    return {
      message: 'Posts retrieved successfully',
      data: posts.map(p => ({ 
        id: p.id,
        content: p.content,
        mediaUrls: p.mediaUrls,
        published: p.published,
        authorId: p.authorId,
        authorName: p.author.name, 
      })),
    };

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
               userId: number) {

    const post = await this.prisma.post.findFirst({
      where: { id, authorId: userId },
      include: {
          author: true
       },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: updatePostDto,
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

  /*==============(Upload media files)==============*/

  async uploadMedia(uploadMediaDto: any, userId: number) {

   
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
   