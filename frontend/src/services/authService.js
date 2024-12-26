import axios from "axios";

const API_URL = "http://127.0.0.1:8000";
const AUTH_API = `${API_URL}/api/auth`;
const USERS_API = `${API_URL}/api/usuarios`;

// Servicios de Autenticación
export const authService = {
    login: async (credentials) => {
        try {
            // Adaptamos las credenciales al formato que espera el backend
            const loginData = {
                contraseña: credentials.password // Cambiamos password por contraseña
            };

            // Añadimos el campo correcto según el tipo de credencial
            if (credentials.emailOrUsername.includes('@')) {
                loginData.correo = credentials.emailOrUsername;
            } else {
                loginData.nombre = credentials.emailOrUsername;
            }

            const response = await axios.post(`${AUTH_API}/login`, loginData);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    register: async (userData) => {
        try {
            const registerData = {
                nombre: userData.nombre,
                correo: userData.email,
                contraseña: userData.password,
                metodo_pago: userData.metodo_pago? userData.metodo_pago : null,  
                rol: userData.rol || 'usuario'
            };

            console.log('Datos enviados al backend:', registerData);

            const response = await axios.post(`${USERS_API}/`, registerData);
            return response.data;
        } catch (error) {
            console.error('Error: ', error);
            throw error.response?.data || error;
        }
    },



    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem('user'));
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};

export const userService = {
    getUsers: async () => {
        try {
            const response = await axios.get(USERS_API);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getUser: async (id) => {
        try {
            const response = await axios.get(`${USERS_API}/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    createUser: async (userData) => {
        try {
            const response = await axios.post(USERS_API, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateUser: async (id, userData) => {
        try {
            const response = await axios.put(`${USERS_API}/${id}`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    deleteUser: async (id) => {
        try {
            const response = await axios.delete(`${USERS_API}/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            authService.logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);