import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { EntrustmentOrder, OrderStatus, MonitoringFrequency } from './entities/entrustment-order.entity';
import { EntrustedItem } from './entities/entrusted-item.entity';
import { CreateEntrustmentOrderDto } from './dto/create-entrustment-order.dto';
import { CompletePickupDto } from './dto/complete-pickup.dto';
import { User, UserRole } from '@src/users/entities/user.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(EntrustmentOrder)
    private entrustmentOrderRepository: Repository<EntrustmentOrder>,
    @InjectRepository(EntrustedItem)
    private entrustedItemRepository: Repository<EntrustedItem>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async createEntrustmentOrder(
    userId: number,
    createEntrustmentOrderDto: CreateEntrustmentOrderDto,
    imagePath?: string,
  ): Promise<EntrustmentOrder> {
    // 1. Definisikan Konstanta Harga
    const PRICE_PER_KG_PER_DAY = 2000; // Harga sewa gudang
    const PICKUP_PRICE_PER_KM = 2500; // Harga pickup per km (> 1km)
    const MONITORING_FEE = {
      [MonitoringFrequency.NONE]: 0,
      [MonitoringFrequency.WEEKLY_ONCE]: 5000,
      [MonitoringFrequency.WEEKLY_TWICE]: 10000,
    };

    if (!createEntrustmentOrderDto.entrustedItems || createEntrustmentOrderDto.entrustedItems.length === 0) {
      throw new BadRequestException('At least one entrusted item is required');
    }

    return await this.entrustmentOrderRepository.manager.transaction(async manager => {
      try {
        // Create the main entrustment order entity
        const entrustmentOrder = manager.create(EntrustmentOrder, {
          ownerId: userId,
          allowChecks: createEntrustmentOrderDto.allowChecks,
          monitoringFrequency: createEntrustmentOrderDto.monitoringFrequency as MonitoringFrequency,
          pickupRequestedDate: createEntrustmentOrderDto.isPickupRequired && createEntrustmentOrderDto.pickupRequestedDate
            ? new Date(createEntrustmentOrderDto.pickupRequestedDate)
            : undefined,
          pickupAddress: createEntrustmentOrderDto.pickupAddress || undefined,
          contactPhone: createEntrustmentOrderDto.contactPhone,
          expectedRetrievalDate: createEntrustmentOrderDto.expectedRetrievalDate
            ? new Date(createEntrustmentOrderDto.expectedRetrievalDate)
            : undefined,
          imagePath: imagePath || undefined,
          status: OrderStatus.PENDING_PICKUP,
          totalPrice: 0, // Inisialisasi awal
        });

        const savedOrder = await manager.save(EntrustmentOrder, entrustmentOrder);
        let totalCalculatedPrice = 0;

        for (const itemDto of createEntrustmentOrderDto.entrustedItems) {
          // --- PENANGANAN ERROR TS (Possibly Undefined) ---
          const weight = itemDto.itemWeight || 0;
          const length = itemDto.itemLength || 0;
          const width = itemDto.itemWidth || 0;
          const height = itemDto.itemHeight || 0;

          // --- LOGIKA BERAT VOLUME VS BERAT AKTUAL ---
          const volumeWeight = (length * width * height) / 6000;
          const finalWeight = Math.max(weight, volumeWeight);

          // --- LOGIKA DURASI (HARI) ---
          const startDate = createEntrustmentOrderDto.pickupRequestedDate
            ? new Date(createEntrustmentOrderDto.pickupRequestedDate)
            : new Date(); // Fallback to NOW if no pickup date provided
          const endDate = createEntrustmentOrderDto.expectedRetrievalDate
            ? new Date(createEntrustmentOrderDto.expectedRetrievalDate)
            : new Date(startDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // Default 7 hari

          const diffDays = Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;

          // --- HITUNG HARGA ITEM ---
          const monitoringPrice = MONITORING_FEE[createEntrustmentOrderDto.monitoringFrequency || 'none'];
          const itemBasePrice = (finalWeight * PRICE_PER_KG_PER_DAY * diffDays);
          const itemTotalPrice = (itemBasePrice + monitoringPrice) * (itemDto.quantity || 1);

          totalCalculatedPrice += itemTotalPrice;

          // Save EntrustedItem
          const entrustedItem = manager.create(EntrustedItem, {
            entrustmentOrderId: savedOrder.id,
            name: itemDto.name.trim(),
            description: itemDto.description?.trim(),
            category: itemDto.category?.trim(),
            estimatedValue: itemDto.estimatedValue,
            itemCondition: itemDto.itemCondition?.trim(),
            itemLength: length,
            itemWidth: width,
            itemHeight: height,
            itemWeight: weight,
            quantity: itemDto.quantity || 1,
            brand: itemDto.brand?.trim(),
            model: itemDto.model?.trim(),
            color: itemDto.color?.trim(),
            specialInstructions: itemDto.specialInstructions?.trim(),
          });

          await manager.save(EntrustedItem, entrustedItem);
          await manager.save(EntrustedItem, entrustedItem);
        }

        // --- TAMBAH BIAYA PICKUP (JIKA ADA) ---
        if (createEntrustmentOrderDto.isPickupRequired && createEntrustmentOrderDto.pickupDistance) {
          const dist = createEntrustmentOrderDto.pickupDistance;
          // Free for first 1km, then 2500 per km
          const pickupFee = dist <= 1 ? 0 : (dist * 2500);

          totalCalculatedPrice += pickupFee;
          console.log(`[PRICING] Added Pickup Fee: ${pickupFee} (Dist: ${dist}km)`);
        } else {
          console.log(`[PRICING] No Pickup Fee (IsRequired: ${createEntrustmentOrderDto.isPickupRequired}, Dist: ${createEntrustmentOrderDto.pickupDistance})`);
        }

        // Update total harga pada order utama
        savedOrder.totalPrice = totalCalculatedPrice; // Pastikan field ini ada di Entity
        await manager.save(EntrustmentOrder, savedOrder);

        const result = await manager.findOne(EntrustmentOrder, {
          where: { id: savedOrder.id },
          relations: ['entrustedItems'],
        });

        if (!result) {
          throw new BadRequestException('Failed to retrieve created entrustment order');
        }

        return result;
      } catch (error) {
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

  //admin
  async findOrdersByStatusForAdmin(status: OrderStatus): Promise<EntrustmentOrder[]> {
    console.log(`ADMIN SERVICE: Fetching orders with status: ${status}`);
    return this.entrustmentOrderRepository.find({
      where: { status },

      relations: {
        owner: true,          // 'owner' adalah nama relasi ke User di entity EntrustmentOrder
        entrustedItems: true, // 'entrustedItems' adalah nama relasi ke Item di entity
      },
      // =================================================================

      order: { createdAt: 'DESC' },
    });
  }
  async completePickupProcess(
    orderId: number,
    completePickupDto: CompletePickupDto,
  ): Promise<EntrustmentOrder> {

    const order = await this.entrustmentOrderRepository.findOneBy({ id: orderId });

    if (!order) {
      throw new NotFoundException(`Entrustment order with ID #${orderId} not found.`);
    }

    if (order.status !== OrderStatus.PENDING_PICKUP) {
      throw new BadRequestException(
        `Order status is '${order.status}', not PENDING_PICKUP. Cannot complete pickup.`,
      );
    }
    order.status = OrderStatus.PICKED_UP;

    return this.entrustmentOrderRepository.save(order);
  }
  async getAdminDashboardSummary() {
    const totalUsers = await this.userRepository.count({ where: { role: UserRole.USER } });
    const totalOrders = await this.entrustmentOrderRepository.count();

    const totalStoredItemsResult = await this.entrustedItemRepository
      .createQueryBuilder("item") // Mulai query dari EntrustedItem
      .leftJoin("item.entrustmentOrder", "order") // Gabungkan dengan EntrustmentOrder
      .where("order.status = :status", { status: OrderStatus.STORED }) // Filter jika status order adalah 'STORED'
      .select("SUM(item.quantity)", "total") // Jumlahkan kuantitas dari item yang sudah terfilter
      .getRawOne();

    const totalItems = parseInt(totalStoredItemsResult.total) || 0;

    return {
      totalUsers,
      totalOrders,
      totalItems,
    };
  }
  async findAllOrdersForAdmin(): Promise<EntrustmentOrder[]> {
    console.log("ADMIN SERVICE: Fetching ALL orders");

    return this.entrustmentOrderRepository.find({
      relations: {
        owner: true,
        entrustedItems: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async updateOrderStatusForAdmin(orderId: number, status: OrderStatus) {
    const order = await this.entrustmentOrderRepository.findOne({
      where: { id: orderId },
      relations: ['entrustedItems', 'owner'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Validasi status yang diperbolehkan (optional)
    if (!Object.values(OrderStatus).includes(status)) {
      throw new BadRequestException('Invalid order status');
    }

    order.status = status;
    return this.entrustmentOrderRepository.save(order);
  }


}