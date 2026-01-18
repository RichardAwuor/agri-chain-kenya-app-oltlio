
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || 'https://efny4tujb4fvak3wz84axmrptxuz7wbq.app.specular.dev';

console.log('API: Backend URL configured as', BACKEND_URL);

export const api = {
  // User Management
  async registerUser(userData: {
    userType: string;
    email?: string;
    phone?: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    idNumber?: string;
    county: string;
    subCounty: string;
    ward: string;
    addressLat?: number;
    addressLng?: number;
    farmAcreage?: number;
    cropType?: string;
    organizationName?: string;
    coreMandate?: string;
    workIdFrontUrl?: string;
    workIdBackUrl?: string;
  }) {
    console.log('API: Registering user', userData);
    const response = await fetch(`${BACKEND_URL}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('API: User registration failed', error);
      throw new Error(`Registration failed: ${error}`);
    }

    const data = await response.json();
    console.log('API: User registered successfully', data);
    return data;
  },

  async getUser(userId: string) {
    console.log('API: Fetching user', userId);
    const response = await fetch(`${BACKEND_URL}/api/users/${userId}`);
    
    if (!response.ok) {
      const error = await response.text();
      console.error('API: Get user failed', error);
      throw new Error(`Failed to get user: ${error}`);
    }

    const data = await response.json();
    console.log('API: User fetched successfully', data);
    return data;
  },

  async updateUser(userId: string, updates: {
    cropType?: string;
    farmAcreage?: number;
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  }) {
    console.log('API: Updating user', userId, updates);
    const response = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('API: Update user failed', error);
      throw new Error(`Failed to update user: ${error}`);
    }

    const data = await response.json();
    console.log('API: User updated successfully', data);
    return data;
  },

  // Location Data
  async getCounties() {
    console.log('API: Fetching counties');
    const response = await fetch(`${BACKEND_URL}/api/locations/counties`);
    
    if (!response.ok) {
      const error = await response.text();
      console.error('API: Get counties failed', error);
      throw new Error(`Failed to get counties: ${error}`);
    }

    const data = await response.json();
    console.log('API: Counties fetched successfully', data);
    return data;
  },

  async getSubCounties(county: string) {
    console.log('API: Fetching sub-counties for', county);
    const response = await fetch(`${BACKEND_URL}/api/locations/sub-counties?county=${encodeURIComponent(county)}`);
    
    if (!response.ok) {
      const error = await response.text();
      console.error('API: Get sub-counties failed', error);
      throw new Error(`Failed to get sub-counties: ${error}`);
    }

    const data = await response.json();
    console.log('API: Sub-counties fetched successfully', data);
    return data;
  },

  async getWards(county: string, subCounty: string) {
    console.log('API: Fetching wards for', { county, subCounty });
    const response = await fetch(`${BACKEND_URL}/api/locations/wards?county=${encodeURIComponent(county)}&subCounty=${encodeURIComponent(subCounty)}`);
    
    if (!response.ok) {
      const error = await response.text();
      console.error('API: Get wards failed', error);
      throw new Error(`Failed to get wards: ${error}`);
    }

    const data = await response.json();
    console.log('API: Wards fetched successfully', data);
    return data;
  },

  async generateFarmerId(county: string, subCounty: string, ward: string) {
    console.log('API: Generating farmer ID for', { county, subCounty, ward });
    const response = await fetch(`${BACKEND_URL}/api/locations/generate-farmer-id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ county, subCounty, ward }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('API: Generate farmer ID failed', error);
      throw new Error(`Failed to generate farmer ID: ${error}`);
    }

    const data = await response.json();
    console.log('API: Farmer ID generated successfully', data);
    return data;
  },

  // Producer Reports
  async createProducerReport(reportData: {
    producerId: string;
    reportType: string;
    weekNumber: number;
    year: number;
    notes?: string;
  }) {
    console.log('API: Creating producer report', reportData);
    const response = await fetch(`${BACKEND_URL}/api/producer-reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('API: Create producer report failed', error);
      throw new Error(`Failed to create report: ${error}`);
    }

    const data = await response.json();
    console.log('API: Producer report created successfully', data);
    return data;
  },

  async getProducerReports(producerId: string) {
    console.log('API: Fetching producer reports for', producerId);
    const response = await fetch(`${BACKEND_URL}/api/producer-reports/${producerId}`);
    
    if (!response.ok) {
      const error = await response.text();
      console.error('API: Get producer reports failed', error);
      throw new Error(`Failed to get reports: ${error}`);
    }

    const data = await response.json();
    console.log('API: Producer reports fetched successfully', data);
    // Return the array directly if it's an array, otherwise return empty array
    return Array.isArray(data) ? data : (data.reports || []);
  },

  async getProjectedHarvest(producerId: string) {
    console.log('API: Fetching projected harvest for', producerId);
    const response = await fetch(`${BACKEND_URL}/api/producer-reports/${producerId}/projected-harvest`);
    
    if (!response.ok) {
      const error = await response.text();
      console.error('API: Get projected harvest failed', error);
      throw new Error(`Failed to get projected harvest: ${error}`);
    }

    const data = await response.json();
    console.log('API: Projected harvest fetched successfully', data);
    return data;
  },
};

export default api;
