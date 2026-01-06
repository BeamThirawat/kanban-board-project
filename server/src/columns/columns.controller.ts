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

import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('columns')
@UseGuards(JwtAuthGuard)
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) { }

  // สร้าง Column ใหม่
  @Post()
  create(@Body() createColumnDto: CreateColumnDto) {
    return this.columnsService.create(createColumnDto);
  }

  // ดึง Column ทั้งหมดของ Board
  @Get()
  findAll(@Query('boardId', ParseUUIDPipe) boardId: string) {
    return this.columnsService.findAllByBoard(boardId);
  }

  // ดึง Column โดย ID
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.columnsService.findOne(id);
  }

  // อัปเดต Column
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateColumnDto: UpdateColumnDto,
  ) {
    return this.columnsService.update(id, updateColumnDto);
  }

  // ลบ Column
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.columnsService.remove(id);
  }
}
