// src/modules/cards/cards.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Card } from './entities/card.entity';

@ApiTags('Cards')
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать новую карточку' })
  @ApiResponse({ status: 201, description: 'Карточка создана', type: Card })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  create(@Body() createCardDto: CreateCardDto): Promise<Card> {
    return this.cardsService.create(createCardDto);
  }

  @Get('column/:columnId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить все карточки колонки' })
  @ApiResponse({ status: 200, description: 'Список карточек', type: [Card] })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  findAllByColumn(@Param('columnId') columnId: string): Promise<Card[]> {
    return this.cardsService.findAllByColumn(columnId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить карточку по ID' })
  @ApiResponse({ status: 200, description: 'Детали карточки', type: Card })
  @ApiResponse({ status: 404, description: 'Карточка не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  findOne(@Param('id') id: string): Promise<Card> {
    return this.cardsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить карточку по ID' })
  @ApiResponse({ status: 200, description: 'Карточка обновлена', type: Card })
  @ApiResponse({ status: 404, description: 'Карточка не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  update(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateCardDto,
  ): Promise<Card> {
    return this.cardsService.update(id, updateCardDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить карточку по ID' })
  @ApiResponse({ status: 200, description: 'Карточка удалена' })
  @ApiResponse({ status: 404, description: 'Карточка не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  remove(@Param('id') id: string): Promise<void> {
    return this.cardsService.remove(id);
  }
}
