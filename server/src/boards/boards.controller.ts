import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Boards')
@ApiBearerAuth('JWT-auth')
@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) { }

  @Post()
  @ApiOperation({ summary: 'Create board', description: 'Create a new Kanban board' })
  @ApiResponse({ status: 201, description: 'Board created successfully with default columns (To Do, Doing, Done)' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Req() req: any, @Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.create(req.user.userId, createBoardDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all boards', description: 'Get all boards for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns list of boards with columns' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Req() req: any) {
    return this.boardsService.findAllByUser(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get board by ID', description: 'Get a specific board with columns and tasks' })
  @ApiParam({ name: 'id', description: 'Board UUID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Returns board with columns and tasks' })
  @ApiResponse({ status: 404, description: 'Board not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.boardsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update board', description: 'Update board information' })
  @ApiParam({ name: 'id', description: 'Board UUID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Board updated successfully' })
  @ApiResponse({ status: 404, description: 'Board not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    return this.boardsService.update(id, req.user.userId, updateBoardDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete board', description: 'Delete a board and all its columns and tasks' })
  @ApiParam({ name: 'id', description: 'Board UUID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Board deleted successfully' })
  @ApiResponse({ status: 404, description: 'Board not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.boardsService.remove(id, req.user.userId);
  }
}
