// src/modules/cards/cards.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body as RequestBody,
  Param,
  UseGuards,
  Query,
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
  ApiBody,
  ApiQuery,
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
  @ApiBody({ type: CreateCardDto })
  @ApiResponse({ status: 201, description: 'Карточка создана', type: Card })
  @ApiResponse({ status: 400, description: 'Неверный формат запроса' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет доступа к колонке' })
  create(@RequestBody() createCardDto: CreateCardDto): Promise<Card> {
    return this.cardsService.create(createCardDto);
  }

  @Get('column/:columnId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить все карточки колонки' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Список карточек', type: [Card] })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Колонка не найдена' })
  findAllByColumn(
    @Param('columnId') columnId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<Card[]> {
    // Здесь нужно добавить пагинацию в CardsService
    return this.cardsService.findAllByColumn(columnId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить карточку по ID' })
  @ApiResponse({ status: 200, description: 'Детали карточки', type: Card })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Карточка не найдена' })
  findOne(@Param('id') id: string): Promise<Card> {
    return this.cardsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить карточку по ID' })
  @ApiBody({ type: UpdateCardDto })
  @ApiResponse({ status: 200, description: 'Карточка обновлена', type: Card })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет доступа к карточке' })
  @ApiResponse({ status: 404, description: 'Карточка не найдена' })
  update(
    @Param('id') id: string,
    @RequestBody() updateCardDto: UpdateCardDto,
  ): Promise<Card> {
    return this.cardsService.update(id, updateCardDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить карточку по ID' })
  @ApiResponse({ status: 200, description: 'Карточка удалена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет доступа к карточке' })
  @ApiResponse({ status: 404, description: 'Карточка не найдена' })
  remove(@Param('id') id: string): Promise<void> {
    return this.cardsService.remove(id);
  }
}
