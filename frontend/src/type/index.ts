// User types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  role: 'user' | 'admin'; // [cite: 44]
  isActive: boolean; // [cite: 45]
  createdAt: string;
  updatedAt: string;
}

// Storage Item types
export enum OrderStatus {
  PENDING_PICKUP = 'PENDING_PICKUP',
  PICKED_UP = 'PICKED_UP',
  STORED = 'STORED',
  PENDING_DELIVERY = 'PENDING_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}
export interface EntrustmentOrder {
  id: number;
  ownerId: number; // Mengikuti nama backend
  allowChecks: boolean; // Mengikuti nama backend
  monitoringFrequency: MonitoringFrequency;
  pickupRequestedDate: string; // Di frontend tetap string untuk kemudahan, konversi ke Date saat dikirim
  pickupAddress: string;
  contactPhone: string; // Field yang ditambahkan
  expectedRetrievalDate?: string;
  status: OrderStatus;
  imagePath?: string; // Field yang ditambahkan
  createdAt: string;
  updatedAt: string;
  entrustedItems: EntrustedItem[]; // Mengikuti nama backend
  owner?: User; // Relasi ke objek User (opsional, tergantung respons API)
}


// INTERFACE UNTUK ITEM DI DALAM ORDER (menggantikan ItemDetail)

export interface EntrustedItem {
  id: number;
  name: string;
  quantity: number; // 
  description?: string;
  category?: string;
  estimatedValue?: string;
  itemCondition?: string;
  brand?: string;
  model?: string;
  color?: string;
  specialInstructions?: string;
}

export enum MonitoringFrequency {
  THREE_DAYS = '3_days', // [cite: 45]
  ONE_WEEK = '1_week', // [cite: 45]
}

export interface ItemDetail {
  id: number;
  itemName: string; // [cite: 48]
  quantity: number; // [cite: 49]
  conditionNotes?: string; // [cite: 49]
  estimatedValue?: number; // [cite: 49]
}

// Form types
export interface StorageItemCreateRequest {
  title: string; // [cite: 49]
  description?: string; // [cite: 49]
  estimatedValue?: number; // [cite: 49]
  durationDays: number; // [cite: 49]
  monitoringEnabled: boolean; // [cite: 50]
  monitoringFrequency: MonitoringFrequency; // [cite: 50]
  allowChecking: boolean; // [cite: 50]
  pickupAddress: string; // [cite: 50]
  pickupNotes?: string; // [cite: 50]
  itemDetails: Omit<ItemDetail, 'id'>[]; // [cite: 50]
}

// Monitoring types
export interface MonitoringRecord {
  id: number;
  conditionStatus: 'excellent' | 'good' | 'fair' | 'poor'; // [cite: 51]
  notes?: string; // [cite: 51]
  photos: MonitoringPhoto[]; // [cite: 51]
  createdAt: string; // [cite: 52]
}

export interface MonitoringPhoto {
  id: number;
  photoPath: string; // [cite: 52]
  caption?: string; // [cite: 52]
  createdAt: string; // [cite: 52]
}

// API Response types
export interface ApiResponse<T> {
  success: boolean; // [cite: 53]
  message: string; // [cite: 53]
  data?: T; // [cite: 53]
  errors?: any; // [cite: 53]
}

export interface PaginatedResponse<T> {
  data: T[]; // [cite: 53]
  total: number; // [cite: 54]
  page: number; // [cite: 54]
  limit: number; // [cite: 54]
  totalPages: number; // [cite: 54]
}