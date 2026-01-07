import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Columns')
@ApiBearerAuth('JWT-auth')
@Controller('columns')
@UseGuards(JwtAuthGuard)
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) { }

  @Post()
  @ApiOperation({ summary: 'Create column', description: 'Create a new column in a board' })
  @ApiResponse({ status: 201, description: 'Column created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createColumnDto: CreateColumnDto) {
    return this.columnsService.create(createColumnDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get columns by board', description: 'Get all columns for a specific board' })
  @ApiQuery({ name: 'boardId', description: 'Board UUID to filter columns', type: 'string' })
  @ApiResponse({ status: 200, description: 'Returns list of columns ordered by position' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query('boardId', ParseUUIDPipe) boardId: string) {
    return this.columnsService.findAllByBoard(boardId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get column by ID', description: 'Get a specific column with tasks' })
  @ApiParam({ name: 'id', description: 'Column UUID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Returns column with tasks' })
  @ApiResponse({ status: 404, description: 'Column not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.columnsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update column', description: 'Update column name or order' })
  @ApiParam({ name: 'id', description: 'Column UUID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Column updated successfully' })
  @ApiResponse({ status: 404, description: 'Column not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateColumnDto: UpdateColumnDto,
  ) {
    return this.columnsService.update(id, updateColumnDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete column', description: 'Delete a column and all its tasks' })
  @ApiParam({ name: 'id', description: 'Column UUID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Column deleted successfully' })
  @ApiResponse({ status: 404, description: 'Column not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.columnsService.remove(id);
  }
}
