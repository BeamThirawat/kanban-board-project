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

import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) { }

  // สร้าง Board ใหม่
  @Post()
  create(@Req() req: any, @Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.create(req.user.userId, createBoardDto);
  }

  // ดึง Board ทั้งหมดของ User
  @Get()
  findAll(@Req() req: any) {
    return this.boardsService.findAllByUser(req.user.userId);
  }

  // ดึง Board โดย ID
  @Get(':id')
  findOne(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.boardsService.findOne(id, req.user.userId);
  }

  // อัปเดต Board
  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    return this.boardsService.update(id, req.user.userId, updateBoardDto);
  }

  // ลบ Board
  @Delete(':id')
  remove(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.boardsService.remove(id, req.user.userId);
  }
}
