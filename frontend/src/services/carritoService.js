import axios from 'axios';
import { API_URL } from "../config/config";

const BASE_URL = `${API_URL}/api`;

export const carritoService = {
    getCart: async (userId) => {
        return await axios.get(`${BASE_URL}/carrito/${userId}`);
    },
    addToCart: async (productId, userId, color, size) => {
        return await axios.post(`${BASE_URL}/carrito/agregar/${productId}`, {
            cart_item: {
                user_id: userId,
                cantidad: 1,
                color: color,
                talla: size
            }
        });
    },
    removeFromCart: async (productId, userId, color, size) => {
        return await axios.delete(
            `${BASE_URL}/carrito/eliminar/${productId}`,
            { 
                data: { 
                    cart_item: {
                        user_id: userId,
                        color: color,
                        talla: size
                    }
                } 
            }
        );
    },
    updateCart: async (productId, userId, newQuantity, color, size) => {
        return await axios.put(`${BASE_URL}/carrito/actualizar/${productId}`, {
            cart_item: {
                user_id: userId,
                cantidad: newQuantity,
                color: color,
                talla: size
            }
        });
    }
};