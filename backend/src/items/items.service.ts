import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { EntrustmentOrder, OrderStatus, MonitoringFrequency } from './entities/entrustment-order.entity';
import { EntrustedItem } from './entities/entrusted-item.entity';
import { CreateEntrustmentOrderDto } from './dto/create-entrustment-order.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(EntrustmentOrder)
    private entrustmentOrderRepository: Repository<EntrustmentOrder>,
    @InjectRepository(EntrustedItem)
    private entrustedItemRepository: Repository<EntrustedItem>,
  ) {}

  async createEntrustmentOrder(
    userId: number,
    createEntrustmentOrderDto: CreateEntrustmentOrderDto,
    imagePath?: string,
  ): Promise<EntrustmentOrder> {
    console.log('=== ITEMS SERVICE CREATE DEBUG ===');
    console.log('User ID:', userId);
    console.log('DTO:', createEntrustmentOrderDto);
    console.log('Image path:', imagePath);

    // Validate DTO
    if (!createEntrustmentOrderDto.entrustedItems || createEntrustmentOrderDto.entrustedItems.length === 0) {
      throw new BadRequestException('At least one entrusted item is required');
    }

    // Start database transaction
    return await this.entrustmentOrderRepository.manager.transaction(async manager => {
      try {
        // Create the main entrustment order (WITHOUT entrustedItems)
        const entrustmentOrder = manager.create(EntrustmentOrder, {
          ownerId: userId,
          allowChecks: createEntrustmentOrderDto.allowChecks,
          monitoringFrequency: createEntrustmentOrderDto.monitoringFrequency as MonitoringFrequency,
          pickupRequestedDate: new Date(createEntrustmentOrderDto.pickupRequestedDate),
          pickupAddress: createEntrustmentOrderDto.pickupAddress,
          contactPhone: createEntrustmentOrderDto.contactPhone,
          expectedRetrievalDate: createEntrustmentOrderDto.expectedRetrievalDate 
            ? new Date(createEntrustmentOrderDto.expectedRetrievalDate) 
            : undefined, // Use undefined instead of null
          imagePath: imagePath || undefined, // Use undefined instead of null
          status: OrderStatus.PENDING_PICKUP,
        });

        console.log('Created entrustment order entity:', entrustmentOrder);

        // Save the main order first to get the ID
        const savedOrder = await manager.save(EntrustmentOrder, entrustmentOrder);
        console.log('Saved entrustment order with ID:', savedOrder.id);

        // Now create and save each entrusted item with the order ID
        const savedItems: EntrustedItem[] = [];
        
        for (let i = 0; i < createEntrustmentOrderDto.entrustedItems.length; i++) {
          const itemDto = createEntrustmentOrderDto.entrustedItems[i];
          
          console.log(`Processing item ${i + 1}:`, itemDto);

          // Validate required fields
          if (!itemDto.name || itemDto.name.trim() === '') {
            throw new BadRequestException(`Item ${i + 1}: name is required`);
          }

          // Create the entrusted item entity
          const entrustedItem = manager.create(EntrustedItem, {
            entrustmentOrderId: savedOrder.id, // Use the saved order ID
            name: itemDto.name.trim(),
            description: itemDto.description ? itemDto.description.trim() : undefined,
            category: itemDto.category ? itemDto.category.trim() : undefined,
            estimatedValue: itemDto.estimatedValue || undefined,
            itemCondition: itemDto.itemCondition ? itemDto.itemCondition.trim() : undefined,
            quantity: itemDto.quantity || 1,
            brand: itemDto.brand ? itemDto.brand.trim() : undefined,
            model: itemDto.model ? itemDto.model.trim() : undefined,
            color: itemDto.color ? itemDto.color.trim() : undefined,
            specialInstructions: itemDto.specialInstructions ? itemDto.specialInstructions.trim() : undefined,
          });

          console.log(`Created entrusted item entity ${i + 1}:`, entrustedItem);

          // Save the item
          const savedItem = await manager.save(EntrustedItem, entrustedItem);
          savedItems.push(savedItem);
          
          console.log(`Saved entrusted item ${i + 1} with ID:`, savedItem.id);
        }

        console.log('All items saved. Total items:', savedItems.length);

        // Return the order with items
        const result = await manager.findOne(EntrustmentOrder, {
          where: { id: savedOrder.id },
          relations: ['entrustedItems'],
        });

        if (!result) {
          throw new BadRequestException('Failed to retrieve created entrustment order');
        }

        console.log('Final result with relations:', result);
        console.log('Items in result:', result.entrustedItems?.length || 0);
        console.log('=== ITEMS SERVICE CREATE SUCCESS ===');

        return result;
      } catch (error) {
        console.error('=== ITEMS SERVICE CREATE ERROR ===');
        console.error('Transaction error:', error);
        throw error;
      }
    });
  }

  async findUserEntrustmentOrders(userId: number): Promise<EntrustmentOrder[]> {
    console.log('=== FIND USER ORDERS DEBUG ===');
    console.log('User ID:', userId);

    try {
      const orders = await this.entrustmentOrderRepository.find({
        where: { ownerId: userId },
        relations: ['entrustedItems', 'owner'], // Include owner relation
        order: { createdAt: 'DESC' },
      });

      console.log('Found orders count:', orders.length);
      orders.forEach((order, index) => {
        console.log(`Order ${index + 1} (ID: ${order.id}):`, {
          status: order.status,
          itemsCount: order.entrustedItems?.length || 0,
          createdAt: order.createdAt,
        });
      });

      console.log('=== FIND USER ORDERS SUCCESS ===');
      return orders;
    } catch (error) {
      console.error('=== FIND USER ORDERS ERROR ===');
      console.error('Error details:', error);
      throw error;
    }
  }

  async findEntrustmentOrderById(orderId: number, userId: number): Promise<EntrustmentOrder> {
    console.log('=== FIND ORDER BY ID DEBUG ===');
    console.log('Order ID:', orderId);
    console.log('User ID:', userId);

    try {
      const order = await this.entrustmentOrderRepository.findOne({
        where: { 
          id: orderId, 
          ownerId: userId // Ensure user owns this order
        },
        relations: ['entrustedItems', 'owner'], // Include owner relation
      });

      if (!order) {
        console.log('Order not found or user does not own it');
        throw new NotFoundException('Entrustment order not found');
      }

      console.log('Found order:', {
        id: order.id,
        status: order.status,
        itemsCount: order.entrustedItems?.length || 0,
      });

      console.log('=== FIND ORDER BY ID SUCCESS ===');
      return order;
    } catch (error) {
      console.error('=== FIND ORDER BY ID ERROR ===');
      console.error('Error details:', error);
      throw error;
    }
  }

  async getUserSummary(userId: number) {
    console.log('=== GET USER SUMMARY DEBUG ===');
    console.log('User ID:', userId);

    try {
      const orders = await this.entrustmentOrderRepository.find({
        where: { ownerId: userId },
        relations: ['entrustedItems'],
      });

      const summary = {
        totalOrders: orders.length,
        totalItems: orders.reduce((sum, order) => 
          sum + (order.entrustedItems?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0), 0
        ),
        ordersByStatus: {
          PENDING_PICKUP: orders.filter(o => o.status === OrderStatus.PENDING_PICKUP).length,
          PICKED_UP: orders.filter(o => o.status === OrderStatus.PICKED_UP).length,
          STORED: orders.filter(o => o.status === OrderStatus.STORED).length,
          PENDING_DELIVERY: orders.filter(o => o.status === OrderStatus.PENDING_DELIVERY).length,
          DELIVERED: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
        },
      };

      console.log('Generated summary:', summary);
      console.log('=== GET USER SUMMARY SUCCESS ===');
      
      return summary;
    } catch (error) {
      console.error('=== GET USER SUMMARY ERROR ===');
      console.error('Error details:', error);
      throw error;
    }
  }

  // Clean up method to remove orphaned items (optional, for maintenance)
  async cleanupOrphanedItems(): Promise<void> {
    console.log('=== CLEANUP ORPHANED ITEMS ===');
    
    try {
      // Find items with null entrustmentOrderId
      const orphanedItems = await this.entrustedItemRepository.find({
        where: { entrustmentOrderId: IsNull() }, // Use TypeORM's IsNull() function
      });

      console.log('Found orphaned items:', orphanedItems.length);

      if (orphanedItems.length > 0) {
        await this.entrustedItemRepository.remove(orphanedItems);
        console.log('Removed orphaned items');
      }

      console.log('=== CLEANUP COMPLETE ===');
    } catch (error) {
      console.error('=== CLEANUP ERROR ===');
      console.error('Error details:', error);
      throw error;
    }
  }
}