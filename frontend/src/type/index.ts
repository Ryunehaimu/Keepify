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
export enum StorageStatus {
  PENDING = 'pending', // [cite: 45]
  PICKED_UP = 'picked_up', // [cite: 45]
  STORED = 'stored', // [cite: 45]
  READY_PICKUP = 'ready_pickup', // [cite: 45]
  RETURNED = 'returned', // [cite: 45]
  CANCELLED = 'cancelled', // [cite: 45]
}

export enum MonitoringFrequency {
  THREE_DAYS = '3_days', // [cite: 45]
  ONE_WEEK = '1_week', // [cite: 45]
}

export interface StorageItem {
  id: number;
  title: string; // [cite: 46]
  description?: string; // [cite: 46]
  estimatedValue?: number; // [cite: 46]
  durationDays: number; // [cite: 46]
  startDate?: string; // [cite: 46]
  endDate?: string; // [cite: 46]
  monitoringEnabled: boolean; // [cite: 46]
  monitoringFrequency: MonitoringFrequency; // [cite: 46]
  allowChecking: boolean; // [cite: 46]
  status: StorageStatus; // [cite: 46]
  pickupAddress?: string; // [cite: 47]
  pickupDate?: string; // [cite: 47]
  pickupNotes?: string; // [cite: 48]
  userId: number; // [cite: 48]
  itemDetails: ItemDetail[]; // [cite: 48]
  monitoringRecords: MonitoringRecord[]; // [cite: 48]
  createdAt: string; // [cite: 48]
  updatedAt: string; // [cite: 48]
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