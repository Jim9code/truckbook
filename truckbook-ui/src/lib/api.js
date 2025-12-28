import { browser } from '$app/environment';

// API base URL - adjust this to match your backend server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://truckbook-production.up.railway.app/api';

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
        },

        // Trips
        getTrips: async (filters = {}) => {
          const queryParams = new URLSearchParams();
          if (filters.date) queryParams.append('date', filters.date);
          if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
          if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
          if (filters.truck) queryParams.append('truck', filters.truck);
          if (filters.driver) queryParams.append('driver', filters.driver);
          if (filters.status) queryParams.append('status', filters.status);
          
          const query = queryParams.toString();
          return apiRequest(`/trips${query ? `?${query}` : ''}`);
        },

        getTripStats: async (filters = {}) => {
          const queryParams = new URLSearchParams();
          if (filters.date) queryParams.append('date', filters.date);
          if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
          if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
          if (filters.status) queryParams.append('status', filters.status);
          
          const query = queryParams.toString();
          return apiRequest(`/trips/stats${query ? `?${query}` : ''}`);
        },

        getTrip: async (tripId) => {
          return apiRequest(`/trips/${tripId}`);
        },

        addTrip: async (tripData) => {
          return apiRequest('/trips', {
            method: 'POST',
            body: JSON.stringify(tripData)
          });
        },

        updateTrip: async (tripId, tripData) => {
          return apiRequest(`/trips/${tripId}`, {
            method: 'PUT',
            body: JSON.stringify(tripData)
          });
        },

        deleteTrip: async (tripId) => {
          return apiRequest(`/trips/${tripId}`, {
            method: 'DELETE'
          });
        },

        // Email Verification
        verifyEmail: async (code) => {
          return apiRequest('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ code })
          });
        },

        resendVerificationCode: async () => {
          return apiRequest('/auth/resend-code', {
            method: 'POST'
          });
        },

        // Maintenance Records
        getTruckMaintenance: async (truckId) => {
          return apiRequest(`/trucks/${truckId}/maintenance`);
        },

        addMaintenanceRecord: async (truckId, maintenanceData) => {
          return apiRequest(`/trucks/${truckId}/maintenance`, {
            method: 'POST',
            body: JSON.stringify(maintenanceData)
          });
        },

        deleteMaintenanceRecord: async (truckId, maintenanceId) => {
          return apiRequest(`/trucks/${truckId}/maintenance/${maintenanceId}`, {
            method: 'DELETE'
          });
        }
      };

