import { browser } from '$app/environment';

// API base URL - adjust this to match your backend server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getToken = () => {
  if (browser) {
    return localStorage.getItem('truckbooks_token');
  }
  return null;
};

// Set auth token in localStorage
export const setToken = (token) => {
  if (browser) {
    localStorage.setItem('truckbooks_token', token);
  }
};

// Remove auth token from localStorage
export const removeToken = () => {
  if (browser) {
    localStorage.removeItem('truckbooks_token');
  }
};

// Make API request
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// API methods
export const api = {
  // Auth endpoints
  signup: async (userData) => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  getMe: async () => {
    return apiRequest('/auth/me');
  },

  // Subscription endpoints
  subscribe: async (planType) => {
    return apiRequest('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ planType })
    });
  },

        getSubscriptionStatus: async () => {
          return apiRequest('/subscriptions/status');
        },

        // Trucks
        getTrucks: async (searchQuery = '') => {
          const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
          return apiRequest(`/trucks${query}`);
        },

        addTruck: async (truckData) => {
          return apiRequest('/trucks', {
            method: 'POST',
            body: JSON.stringify(truckData)
          });
        },

        updateTruck: async (truckId, truckData) => {
          return apiRequest(`/trucks/${truckId}`, {
            method: 'PUT',
            body: JSON.stringify(truckData)
          });
        },

        // Drivers
        getDrivers: async (searchQuery = '') => {
          const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
          return apiRequest(`/drivers${query}`);
        },

        addDriver: async (driverData) => {
          return apiRequest('/drivers', {
            method: 'POST',
            body: JSON.stringify(driverData)
          });
        }
      };

