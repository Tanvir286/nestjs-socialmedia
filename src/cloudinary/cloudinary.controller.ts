import { Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';


@Controller('cloudinary')
export class CloudinaryController {

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  // Upload a single file
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {

    const result = await this.cloudinaryService.uploadFile(file);

    return {
        message: 'Image uploaded successfully',
        data:{
            url: result.secure_url, 
            version: result.version,
            display_name: result.display_name,
            format: result.format,
            resource_type: result.resource_type,
        }
    }
  }

  // Upload multiple files
  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMultipleFile(@UploadedFiles() files: Express.Multer.File[]) {

    const result = await this.cloudinaryService.uploadMultipleFiles(files);

    return {
        message: 'Image uploaded successfully',
        data: result.map((result) => ({
            url: result.secure_url, 
            version: result.version,
            display_name: result.display_name,
            format: result.format,
            resource_type: result.resource_type,
        }))
    }
  }

  
  



}
