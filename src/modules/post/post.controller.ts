import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFiles, Query } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadMediaDto } from './dto/upload-media.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DeleteImageDto } from './dto/delete-image.dto';
import { PaginationQueryDto } from 'src/common/pagination/pagination-query.dto';
import { OffsetPaginationDto } from 'src/common/pagination';

@Controller('post')
export class PostController {

  constructor(private readonly postService: PostService) {}
  
  // Create a new post 
  @UseGuards(JwtAuthGuard)
  @Post('create')
  @UseInterceptors(FilesInterceptor('mediaUrls', 10)) // max 10 files
  create(@Body() createPostDto: CreatePostDto,
         @Req() req: any,
         @UploadedFiles() files: Express.Multer.File[]
        ) {
  const userId = req.user.id;
  return this.postService.create(createPostDto, userId, files);
  }

  // Get all posts
  @Get('allpost')
  findAll(
       @Query() paginationQuery: OffsetPaginationDto
  ) {
  return this.postService.findAll(paginationQuery);
  }

  // Get a single post by ID
  @Get('singlebyId/:id')
  findOne(@Param('id') id: string) {
  return this.postService.findOne(+id);
  }


  // Update a post by ID
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('mediaUrls', 10)) 
  @Patch('updatebyId/:id')
  update(@Param('id') id: string, 
         @Body() updatePostDto: UpdatePostDto,
         @Req() req: any,
         @UploadedFiles() files: Express.Multer.File[]
       ) {
  const userId = req.user.id;
  return this.postService.update(+id, updatePostDto, userId, files);
  }


  // delete-image route
  @UseGuards(JwtAuthGuard)
  @Patch('delete-image/:id')
  async deleteImage(@Param('id') id: string,
                   @Body() deleteImageDto: DeleteImageDto,
                   @Req() req: any) {
  const userId = req.user.id;
  return this.postService.deleteImage(+id, deleteImageDto, userId);
 }

  
  // Delete a post by ID
  @UseGuards(JwtAuthGuard)
  @Delete('deletebyId/:id')
  remove(@Param('id') id: string,
         @Req() req: any) {
  const userId = req.user.id;
  console.log(userId);
  return this.postService.remove(+id, userId);
  }

  
  



}
