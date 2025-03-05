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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new card' })
  @ApiBody({ type: CreateCardDto })
  @ApiResponse({ status: 201, description: 'Card created successfully', type: Card })
  @ApiResponse({ status: 400, description: 'Invalid request format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'No access to the column' })
  create(@RequestBody() createCardDto: CreateCardDto): Promise<Card> {
    return this.cardsService.create(createCardDto);
  }

  @Get('column/:columnId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all cards for a column' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'List of cards', type: [Card] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Column not found' })
  findAllByColumn(
    @Param('columnId') columnId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<Card[]> {
    // Pagination needs to be added in CardsService
    return this.cardsService.findAllByColumn(columnId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a card by ID' })
  @ApiResponse({ status: 200, description: 'Card details', type: Card })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Card not found' })
  findOne(@Param('id') id: string): Promise<Card> {
    return this.cardsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a card by ID',
    description: 'Updates the card with the specified ID. Only the following fields are processed: title, description, columnId, labels, dueDate, images. Fields like id, createdAt, updatedAt, number, dashboardId, members, checklists, comments, and attachments are ignored. Use separate endpoints to manage related entities (e.g., members, checklists, comments, attachments).',
  })
  @ApiBody({ type: UpdateCardDto })
  @ApiResponse({ status: 200, description: 'Card updated successfully', type: Card })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'No access to the card' })
  @ApiResponse({ status: 404, description: 'Card not found' })
  update(
    @Param('id') id: string,
    @RequestBody() updateCardDto: UpdateCardDto,
  ): Promise<Card> {
    return this.cardsService.update(id, updateCardDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a card by ID' })
  @ApiResponse({ status: 200, description: 'Card deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'No access to the card' })
  @ApiResponse({ status: 404, description: 'Card not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.cardsService.remove(id);
  }
}