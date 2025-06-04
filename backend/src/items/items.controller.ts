// src/items/items.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpException,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ItemsService } from './items.service';
import { CreateEntrustmentOrderDto } from './dto/create-entrustment-order.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('items')
@UseGuards(JwtAuthGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
          return cb(new HttpException('Only image files are allowed!', HttpStatus.BAD_REQUEST), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async createEntrustmentOrder(
    @Request() req: any,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<any> {
    try {
      console.log('=== CREATE ENTRUSTMENT ORDER DEBUG ===');
      console.log('Raw body:', body);
      console.log('File:', file);
      console.log('User:', req.user);

      // Parse entrustedItems from string to object
      let entrustedItems;
      if (typeof body.entrustedItems === 'string') {
        entrustedItems = JSON.parse(body.entrustedItems);
      } else {
        entrustedItems = body.entrustedItems;
      }
      
      console.log('Parsed entrustedItems:', entrustedItems);
      
      // Validate entrustedItems
      if (!Array.isArray(entrustedItems) || entrustedItems.length === 0) {
        throw new BadRequestException('entrustedItems must be a non-empty array');
      }

      // Clean and validate each item
      const cleanedItems = entrustedItems.map((item, index) => {
        console.log(`Processing item ${index}:`, item);
        
        // Ensure required fields are present and not empty
        if (!item.name || item.name.trim() === '') {
          throw new BadRequestException(`Item ${index + 1}: name is required`);
        }

        const cleanedItem = {
          name: item.name.trim(),
          description: item.description ? item.description.trim() : undefined,
          category: item.category ? item.category.trim() : undefined,
          estimatedValue: item.estimatedValue || undefined,
          itemCondition: item.itemCondition ? item.itemCondition.trim() : undefined,
          quantity: parseInt(item.quantity) || 1,
          brand: item.brand ? item.brand.trim() : undefined,
          model: item.model ? item.model.trim() : undefined,
          color: item.color ? item.color.trim() : undefined,
          specialInstructions: item.specialInstructions ? item.specialInstructions.trim() : undefined,
        };

        console.log(`Cleaned item ${index}:`, cleanedItem);
        return cleanedItem;
      });

      console.log('All cleaned items:', cleanedItems);

      // Create the main DTO
      const createEntrustmentOrderDto: CreateEntrustmentOrderDto = {
        allowChecks: body.allowChecks === 'true' || body.allowChecks === true,
        monitoringFrequency: body.monitoringFrequency || 'none',
        pickupRequestedDate: body.pickupRequestedDate,
        pickupAddress: body.pickupAddress,
        contactPhone: body.contactPhone,
        expectedRetrievalDate: body.expectedRetrievalDate || undefined,
        entrustedItems: cleanedItems,
      };

      console.log('Final DTO:', createEntrustmentOrderDto);

      // Add image path if file uploaded
      const imagePath = file ? file.path : undefined;
      console.log('Image path:', imagePath);

      // Create the entrustment order
      const result = await this.itemsService.createEntrustmentOrder(
        req.user.id,
        createEntrustmentOrderDto,
        imagePath,
      );

      console.log('Created order result:', result);
      console.log('=== CREATE ENTRUSTMENT ORDER SUCCESS ===');

      return {
        success: true,
        message: 'Entrustment order created successfully',
        data: result,
      };

    } catch (error) {
      console.error('=== CREATE ENTRUSTMENT ORDER ERROR ===');
      console.error('Error details:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create entrustment order',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('my-items')
  async getMyItems(@Request() req: any): Promise<any> {
    try {
      console.log('=== GET MY ITEMS DEBUG ===');
      console.log('User ID:', req.user.id);
      
      const items = await this.itemsService.findUserEntrustmentOrders(req.user.id);
      
      console.log('Found items count:', items.length);
      console.log('Sample item:', items[0]);
      console.log('=== GET MY ITEMS SUCCESS ===');
      
      return {
        success: true,
        data: items,
      };
    } catch (error) {
      console.error('=== GET MY ITEMS ERROR ===');
      console.error('Error details:', error);
      
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch user items',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getItemById(@Param('id', ParseIntPipe) id: number, @Request() req: any): Promise<any> {
    try {
      console.log('=== GET ITEM BY ID DEBUG ===');
      console.log('Item ID:', id);
      console.log('User ID:', req.user.id);
      
      const item = await this.itemsService.findEntrustmentOrderById(id, req.user.id);
      
      if (!item) {
        throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
      }
      
      console.log('Found item:', item);
      console.log('Items in order:', item.entrustedItems?.length || 0);
      console.log('=== GET ITEM BY ID SUCCESS ===');
      
      return {
        success: true,
        data: item,
      };
    } catch (error) {
      console.error('=== GET ITEM BY ID ERROR ===');
      console.error('Error details:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch item',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('summary/my-summary')
  async getMySummary(@Request() req: any): Promise<any> {
    try {
      console.log('=== GET MY SUMMARY DEBUG ===');
      console.log('User ID:', req.user.id);
      
      const summary = await this.itemsService.getUserSummary(req.user.id);
      
      console.log('Summary:', summary);
      console.log('=== GET MY SUMMARY SUCCESS ===');
      
      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      console.error('=== GET MY SUMMARY ERROR ===');
      console.error('Error details:', error);
      
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch summary',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}