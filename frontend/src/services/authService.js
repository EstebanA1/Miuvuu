import axios from "axios";

const API_URL = "http://127.0.0.1:8000";
const AUTH_API = `${API_URL}/api/auth/`;
const USERS_API = `${API_URL}/api/usuarios/`;

export const authService = {
    login: async (credentials) => {
        try {
            const loginData = {
                contraseña: credentials.password
            };

            if (credentials.emailOrUsername.includes('@')) {
                loginData.correo = credentials.emailOrUsername;
            } else {
                loginData.nombre = credentials.emailOrUsername;
            }

            console.log('Enviando datos al backend:', loginData);

            const response = await axios.post(`${AUTH_API}login`, loginData);

            console.log('Respuesta del backend:', response.data);

            if (!response.data) {
                throw new Error('No se recibió respuesta del servidor');
            }

            if (response.data.access_token) {
                localStorage.setItem('token', response.data.access_token);

                if (response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }

                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;

                return {
                    success: true,
                    user: response.data.user
                };
            } else {
                console.log('Respuesta sin access_token:', response.data);
                throw new Error('La respuesta no contiene un token válido');
            }
        } catch (error) {
            console.error('Error detallado en login:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            throw {
                success: false,
                message: error.response?.data?.detail ||
                    error.response?.data?.message ||
                    error.message ||
                    'Error al iniciar sesión'
            };
        }
    },

    register: async (userData) => {
        try {
            const registerData = {
                nombre: userData.nombre,
                correo: userData.email,
                contraseña: userData.password,
                metodo_pago: userData.metodo_pago || null,
                rol: userData.rol || 'usuario'
            };
            console.log('Datos de registro enviados al backend:', registerData);

            const response = await axios.post(`${USERS_API}`, registerData);
            console.log('Respuesta del registro:', response.data);

            if (response.data) {
                try {
                    await authService.login({
                        emailOrUsername: userData.email,
                        password: userData.password
                    });
                } catch (loginError) {
                    console.error('Error al iniciar sesión después del registro:', loginError);
                }
                return {
                    success: true,
                    user: response.data
                };
            }

            throw new Error('No se recibió respuesta del servidor durante el registro');
        } catch (error) {
            console.error('Error en registro:', error);

            if (error.response?.data?.detail?.includes('usuarios_correo_key')) {
                throw {
                    success: false,
                    message: 'Este correo electrónico ya está registrado'
                };
            }

            throw {
                success: false,
                message: error.response?.data?.detail ||
                    error.response?.data?.message ||
                    error.message ||
                    'Error al registrarse'
            };
        }
    },

    logout: () => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete axios.defaults.headers.common['Authorization'];
            return true;
        } catch (error) {
            console.error('Error durante el logout:', error);
            return false;
        }
    },

    getCurrentUser: () => {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Error al obtener usuario actual:', error);
            return null;
        }
    },

    isAuthenticated: () => {
        try {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');
            return !!(token && user);
        } catch (error) {
            console.error('Error al verificar autenticación:', error);
            return false;
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
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export const userService = {
    getUsers: async () => {
        try {
            const response = await axios.get(USERS_API);
            const processedUsers = response.data.map(user => ({
                ...user,
                metodo_pago: user.metodo_pago || [], 
                rol: user.rol || 'usuario' 
            }));
            return processedUsers;
        } catch (error) {
            console.error('Error en getUsers:', error);
            throw error.response?.data || error;
        }
    },

    getUser: async (id) => {
        try {
            const response = await axios.get(`${USERS_API}${id}`);
            const processedUser = {
                ...response.data,
                metodo_pago: response.data.metodo_pago || [],
                rol: response.data.rol || 'usuario'
            };
            return processedUser;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    createUser: async (userData) => {
        try {
            const processedData = {
                ...userData,
                metodo_pago: userData.metodo_pago || [],
                rol: userData.rol || 'usuario'
            };
            const response = await axios.post(USERS_API, processedData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateUser: async (id, userData) => {
        try {
            const processedData = {
                nombre: userData.nombre,
                correo: userData.correo,
                contraseña: userData.contraseña, 
                rol: userData.rol || 'usuario',
                metodo_pago: userData.metodo_pago || []
            };
            const response = await axios.put(`${USERS_API}${id}`, processedData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    deleteUser: async (id) => {
        try {
            const response = await axios.delete(`${USERS_API}${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};