import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('post')
export class PostController {

  constructor(private readonly postService: PostService) {}
  
  // Create a new post 
  @UseGuards(JwtAuthGuard)
  @Post('create')
  create(@Body() createPostDto: CreatePostDto,
         @Req() req: any
        ) {
  const userId = req.user.id;
  return this.postService.create(createPostDto, userId);
  }

  // Get all posts
  @Get('allpost')
  findAll() {
    return this.postService.findAll();
  }

  // Get a single post by ID
  @Get('singlebyId/:id')
  findOne(@Param('id') id: string) {
  return this.postService.findOne(+id);
  }

  // Update a post by ID
  @UseGuards(JwtAuthGuard)
  @Patch('updatebyId/:id')
  update(@Param('id') id: string, 
         @Body() updatePostDto: UpdatePostDto,
         @Req() req: any) {
  const userId = req.user.id;
  return this.postService.update(+id, updatePostDto, userId);
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
