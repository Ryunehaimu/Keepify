import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'; // Ditambahkan AxiosRequestConfig dan AxiosResponse untuk tipe yang lebih eksplisit jika diperlukan, meskipun tidak secara langsung digunakan di implementasi bawah
import { EntrustmentOrder } from '@/type'; 
interface AdminDashboardSummary {
  totalUsers: number;
  totalOrders: number;
  totalItems: number;
  // Tambahkan properti lain yang relevan jika ada
}
class ApiClient {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', // [cite: 56]
    });
    this.setupInterceptors(); // [cite: 56]
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => { // Mengubah parameter menjadi config saja agar sesuai dengan penggunaan
        const token = localStorage.getItem('keepify_token'); // [cite: 57]
        if (token) {
          config.headers.Authorization = `Bearer ${token}`; // [cite: 57]
        }
        return config; // [cite: 57]
      },
      (error) => {
        return Promise.reject(error); // [cite: 57]
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response, // [cite: 58]
      (error) => {
        if (error.response?.status === 401) { // [cite: 58]
          localStorage.removeItem('keepify_token'); // [cite: 58]
          window.location.href = '/login'; // [cite: 58]
        }
        return Promise.reject(error); // [cite: 58]
      }
    );
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password }); // Perbaikan: destrukturisasi email dan password [cite: 59, 60]
    return response.data; // [cite: 60]
  }

  async register(userData: any) { //
    const response = await this.api.post('/auth/register', userData); // [cite: 60]
    return response.data; // [cite: 60]
  }

  async getProfile() {
    const response = await this.api.get('/auth/profile'); // [cite: 61]
    return response.data; // [cite: 61]
  }

  async getMyDashboardSummary(): Promise<any> { // Ganti any dengan tipe data summary
    const response = await this.api.get('/items/summary/my-summary'); // Sesuaikan dengan endpoint backend Anda
    return response.data;
  }

  // Storage items methods
  async getMyItems() {
    const response = await this.api.get('/items/my-items'); // [cite: 61]
    return response.data; // [cite: 61]
  }

  async createStorageItem(data: FormData) { // Ubah tipe 'any' menjadi FormData
    const response = await this.api.post('/items', data, {
      headers: {
        'Content-Type': 'multipart/form-data', // Tambahkan header di sini
      },
    });
    return response.data;
  }

    // NEW: Create entrustment order method
  async createEntrustmentOrder(formData: FormData) {
    try {
      console.log('Creating entrustment order...');
      
      // Log FormData contents for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`FormData ${key}:`, value);
      }

      const response = await this.api.post('/items', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Entrustment order created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Create entrustment order error:', error);
      
      // Enhanced error handling
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.message || 'Failed to create entrustment order';
        const details = error.response.data?.details || '';
        
        console.error('Server error response:', {
          status,
          message,
          details,
          data: error.response.data
        });
        
        throw new Error(`Error ${status}: ${message}${details ? ' - ' + details : ''}`);
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
        throw new Error('Server tidak merespons. Periksa koneksi network dan pastikan backend server berjalan.');
      } else {
        // Something else happened
        console.error('Request setup error:', error.message);
        throw new Error('Terjadi kesalahan saat membuat request: ' + error.message);
      }
    }
  }

  async getStorageItem(id: number) {
    const response = await this.api.get(`/items/${id}`); // [cite: 62]
    return response.data; // [cite: 63]
  }

  public async post(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
    const response = await this.api.post(url, data, config);
    return response.data;
  }

  // Metode get generik juga bisa berguna
  public async get(url: string, config?: AxiosRequestConfig): Promise<any> {
    const response = await this.api.get(url, config);
    return response.data;
  }

  // Admin methods
  async getPendingPickups() {
    const response = await this.api.get('/admin/pending-pickups'); // [cite: 63]
    return response.data; // [cite: 63]
  }
  async getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
    const response = await this.api.get('/admin/dashboard/summary');
    return response.data;
  }
  async getMonitoringSchedule() {
    const response = await this.api.get('/admin/monitoring-schedule'); // [cite: 63]
    return response.data; // [cite: 63]
  }
    async getOrdersByStatus(status: string): Promise<EntrustmentOrder[]> {
    const response = await this.api.get('/admin/orders', { params: { status } });
    return response.data;
  }

  async completePickup(orderId: number, data: { signatureImage: string }): Promise<EntrustmentOrder> {
    const response = await this.api.post(`/admin/orders/${orderId}/complete-pickup`, data);
    return response.data;
  }
  // File upload
  async uploadFile(file: File, path: string) { // [cite: 64]
    const formData = new FormData(); // [cite: 64]
    formData.append('file', file); // [cite: 65]
    formData.append('path', path); // [cite: 65]

    const response = await this.api.post('/uploads', formData, { // [cite: 65]
      headers: {
        'Content-Type': 'multipart/form-data', // [cite: 65]
      },
    });
    return response.data; // [cite: 65]
  }
  
}

export const apiClient = new ApiClient(); // [cite: 65]