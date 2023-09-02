import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './posts.service';
import { Post as PostEntity } from './post.entity';
import { PostDto } from './dto/post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postService: PostsService) {}

  @Get()
  async findAll() {
    // Get all posts in the db
    return await this.postService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<PostEntity> {
    // Find the post with this id
    const post = await this.postService.findOne(id);

    // If the post does not exist in the db, throw a 404 error
    if (!post) {
      throw new NotFoundException('This post does not exist');
    }

    // If post exists, returnthe post
    return post;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() post: PostDto, @Request() req): Promise<PostEntity> {
    // Create a new post and return the newly created post
    return await this.postService.create(post, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() post: PostDto,
    @Request() req,
  ): Promise<PostEntity> {
    // Get the number of row affected and the updated post
    const { numberOfAffectedRows, updatedPost } = await this.postService.update(
      id,
      post,
      req.user.id,
    );

    // If the number of rows affected is zero,
    // then the post does not exist in our DB
    if (numberOfAffectedRows === 0) {
      throw new NotFoundException('This post does not exist');
    }

    // Return the updated post
    return updatedPost;
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: number, @Request() req) {
    // Delete the post with this id
    const deleted = await this.postService.delete(id, req.user.id);

    // If the number of row affected is zero,
    // then the post does not exist in our DB
    if (deleted === 0) {
      throw new NotFoundException('This post does not exist');
    }

    // Return success message
    return 'Successfully deleted';
  }
}
