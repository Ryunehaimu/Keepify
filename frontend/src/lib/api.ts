import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { EntrustmentOrder } from '@/type';

interface AdminDashboardSummary {
  totalUsers: number;
  totalOrders: number;
  totalItems: number;
}

class ApiClient {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      // Pastikan menggunakan NEXT_PUBLIC_ agar terbaca di browser
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 

    // --- REQUEST INTERCEPTOR ---
    this.api.interceptors.request.use(
      (config) => {
        // ✅ PENGAMAN 1: Cek apakah kita sedang di Browser (bukan Server)
        if (typeof window !== 'undefined') {
          try {
            // ✅ PENGAMAN 2: Cek apakah localStorage valid (anti-crash di Linux)
            if (window.localStorage && typeof window.localStorage.getItem === 'function') {
              const token = localStorage.getItem('keepify_token');
              if (token) {
                config.headers.Authorization = `Bearer ${token}`;
              }
            }
          } catch (error) {
            // Jika error terjadi di localStorage, diamkan saja (jangan crash)
            console.warn('LocalStorage access failed safely in interceptor');
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // --- RESPONSE INTERCEPTOR ---
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Cek Unauthorized (401)
        if (error.response?.status === 401) {
          // Hanya lakukan redirect jika di Browser
          if (typeof window !== 'undefined') {
            try {
              if (window.localStorage && typeof window.localStorage.removeItem === 'function') {
                localStorage.removeItem('keepify_token');
              }
              if (window.location) {
                window.location.href = '/login';
              }
            } catch (e) {
              console.error('Logout redirect failed safely', e);
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // --- AUTH METHODS ---
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(userData: any) {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async sendRegisterOtp(email: string) {
    const response = await this.api.post('/auth/send-register-otp', { email });
    return response.data;
  }

  async getProfile() {
    const response = await this.api.get('/auth/profile');
    return response.data;
  }

  // --- DASHBOARD METHODS ---
  async getMyDashboardSummary(): Promise<any> {
    const response = await this.api.get('/items/summary/my-summary');
    return response.data;
  }

  // --- ITEM/STORAGE METHODS ---
  async getMyItems() {
    const response = await this.api.get('/items/my-items');
    return response.data;
  }

  async createStorageItem(data: FormData) {
    const response = await this.api.post('/items', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getStorageItem(id: number) {
    const response = await this.api.get(`/items/${id}`);
    return response.data;
  }

  // --- ENTRUSTMENT ORDER (Complex Logic) ---
  async createEntrustmentOrder(formData: FormData) {
    try {
      console.log('Creating entrustment order...');
      const response = await this.api.post('/items', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Create entrustment order error:', error);
      if (error.response) {
        throw new Error(`Error ${error.response.status}: ${error.response.data?.message || 'Failed'}`);
      } else if (error.request) {
        throw new Error('Server tidak merespons. Cek koneksi backend.');
      } else {
        throw new Error(error.message);
      }
    }
  }

  // --- UTILITY METHODS ---
  public async post(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
    const response = await this.api.post(url, data, config);
    return response.data;
  }

  public async get(url: string, config?: AxiosRequestConfig): Promise<any> {
    const response = await this.api.get(url, config);
    return response.data;
  }

  // --- ADMIN METHODS ---
  async getPendingPickups() {
    const response = await this.api.get('/admin/pending-pickups');
    return response.data;
  }

  async getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
    const response = await this.api.get('/admin/dashboard/summary');
    return response.data;
  }

  async getMonitoringSchedule() {
    const response = await this.api.get('/admin/monitoring-schedule');
    return response.data;
  }

  async getOrdersByStatus(status: string): Promise<EntrustmentOrder[]> {
    const response = await this.api.get('/admin/orders', { params: { status } });
    return response.data;
  }

  async getAllOrders(): Promise<EntrustmentOrder[]> {
    const response = await this.api.get('/admin/orders');
    return response.data;
  }

  async adminUpdateStatus(orderId: number, body: { status: string }): Promise<EntrustmentOrder> {
    const response = await this.api.post(`/admin/orders/${orderId}/update-status`, body);
    return response.data;
  }

  async completePickup(orderId: number, data: { signatureImage: string }): Promise<EntrustmentOrder> {
    const response = await this.api.post(`/admin/orders/${orderId}/complete-pickup`, data);
    return response.data;
  }

  async uploadFile(file: File, path: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    const response = await this.api.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Placeholder untuk method yang belum diimplementasi
  updateOrderStatus(id: any, arg1: { status: any }) {
    console.warn('Method updateOrderStatus is deprecated or not implemented, use adminUpdateStatus instead.');
    // Fallback ke method adminUpdateStatus jika memungkinkan
    return this.adminUpdateStatus(id, arg1);
  }
}

export const apiClient = new ApiClient();