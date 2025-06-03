import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'; // Ditambahkan AxiosRequestConfig dan AxiosResponse untuk tipe yang lebih eksplisit jika diperlukan, meskipun tidak secara langsung digunakan di implementasi bawah

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

  // Storage items methods
  async getMyItems() {
    const response = await this.api.get('/items/my-items'); // [cite: 61]
    return response.data; // [cite: 61]
  }

  async createStorageItem(data: any) { //
    const response = await this.api.post('/items', data); // [cite: 62]
    return response.data; // [cite: 62]
  }

  async getStorageItem(id: number) {
    const response = await this.api.get(`/items/${id}`); // [cite: 62]
    return response.data; // [cite: 63]
  }

  // Admin methods
  async getPendingPickups() {
    const response = await this.api.get('/admin/pending-pickups'); // [cite: 63]
    return response.data; // [cite: 63]
  }

  async getMonitoringSchedule() {
    const response = await this.api.get('/admin/monitoring-schedule'); // [cite: 63]
    return response.data; // [cite: 63]
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