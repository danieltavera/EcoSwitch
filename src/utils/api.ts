import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de la API
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.0.21:3000'  // IP local para desarrollo
  : 'https://your-production-api-url.com'; // URL de producción

const TOKEN_KEY = 'jwt_token';

// Interfaz para opciones de petición
export interface ApiOptions {
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  [key: string]: any;
}

// Función base para hacer peticiones a la API
export const apiRequest = async (endpoint: string, options: ApiOptions & { method?: string; body?: string } = {}) => {
  const { requiresAuth = true, method = 'GET', headers: customHeaders = {}, ...restOptions } = options;
  
  // Headers base
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // Agregar token de autenticación si es necesario
  if (requiresAuth) {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
      if (__DEV__) console.log('Added auth token to request');
    } else {
      throw new Error('UNAUTHORIZED');
    }
  } else {
    if (__DEV__) console.log('Request does not require authentication');
  }

  // Construir URL completa
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  if (__DEV__) console.log('Full URL:', url);

  // Realizar petición
  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      ...restOptions,
    });

    if (__DEV__) console.log('Response status:', response.status);

    // Manejar respuestas no autorizadas
    if (response.status === 401) {
      if (__DEV__) console.log('Received 401 response, clearing token');
      // Token expirado o inválido
      await AsyncStorage.removeItem(TOKEN_KEY);
      throw new Error('UNAUTHORIZED');
    }

    // Parsear respuesta JSON
    const responseData = await response.json();
    if (__DEV__) console.log('Response data:', responseData);

    if (!response.ok) {
      if (__DEV__) console.log('Response not ok:', response.status, responseData);
      throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Funciones de conveniencia para diferentes métodos HTTP
export const apiGet = (endpoint: string, options: ApiOptions = {}) => {
  return apiRequest(endpoint, { method: 'GET', ...options });
};

export const apiPost = (endpoint: string, data: any, options: ApiOptions = {}) => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
};

export const apiPut = (endpoint: string, data: any, options: ApiOptions = {}) => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
};

export const apiDelete = (endpoint: string, options: ApiOptions = {}) => {
  return apiRequest(endpoint, { method: 'DELETE', ...options });
};

// Función específica para registro
export const registerApi = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
}) => {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
    }),
    requiresAuth: false,
  });
};

// Función específica para login
export const loginApi = async (email: string, password: string) => {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    requiresAuth: false,
  });
};

// Función específica para forgot password
export const forgotPasswordApi = async (email: string) => {
  return apiRequest('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
    requiresAuth: false,
  });
};
