import axios from 'axios';
import { API_CONFIG } from '../config/api-config.js';

class BreezeAPIClient {
  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
    this.apiKey = API_CONFIG.apiKey;
    this.secretKey = API_CONFIG.secretKey;
    this.sessionToken = API_CONFIG.sessionToken;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      }
    });
    
    this.setupInterceptors();
  }
  
  setupInterceptors() {
    // Request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        if (this.sessionToken) {
          config.headers.Authorization = `Bearer ${this.sessionToken}`;
        }
        console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );
    
    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} - ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ API Error:', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );
  }
  
  async makeRequest(endpoint, params = {}, method = 'GET') {
    try {
      const response = await this.client.request({
        method,
        url: endpoint,
        params: method === 'GET' ? params : undefined,
        data: method !== 'GET' ? params : undefined
      });
      
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status || 500
      };
    }
  }
  
  // Test API connectivity
  async testConnection() {
    console.log('🔍 Testing Breeze API connection...');
    
    // Try a simple endpoint to test connectivity
    const result = await this.makeRequest('/customer/profile');
    
    if (result.success) {
      console.log('✅ API connection successful');
      return true;
    } else {
      console.log('❌ API connection failed:', result.error);
      return false;
    }
  }
}

export default BreezeAPIClient;