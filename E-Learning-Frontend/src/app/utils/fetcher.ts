// utils/fetcher.ts'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface FetcherOptions extends RequestInit {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any; // Use `any` for flexibility; prefer `unknown` for strict typing
  token?: string; // Optional authorization token
}

const fetcher = async (url: string, options = {}) => {
  try {
    const response = await fetch(url, options);

    // Log response status and body (for debugging purposes)
    ;

    // Read raw response text for debugging
    const responseText = await response.text();
    ;

    // Parse as JSON if it's not empty
    if (responseText) {
      return JSON.parse(responseText);
    } else {
      throw new Error('Empty response body');
    }
  } catch (error: any) {
    console.error(`Error fetching ${url}:`, error.message);
    throw new Error(error.message || 'An unknown error occurred');
  }
};

export default fetcher;
