// services/api.ts
import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api', // Ensure your NestJS backend is running at this URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generic fetchData function to handle API requests
export const fetchData = async <T>(
  endpoint: string, 
  method: string, 
  data: any
): Promise<T> => {
  try {
    const response = await api.request<T>({
      url: endpoint,
      method: method,
      data: data,  // Send the data as the request body
      headers: {
        'Content-Type': 'application/json',  // Ensure JSON content type is sent
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error:', error);
    throw error;
  }
};
