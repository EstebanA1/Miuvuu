import React, { createContext, useContext, useState, useCallback } from 'react';
import { carritoService } from '../services/carritoService';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);

    const updateCart = useCallback(async (userId) => {
        try {
            const response = await carritoService.getCart(userId);
            const items = response.data.carrito || [];
            setCartItems(items);
            const totalItems = items.reduce((total, item) => total + item.cantidad, 0);
            setCartCount(totalItems);
            return items; 
        } catch (error) {
            console.error('Error al actualizar carrito:', error);
            throw error; 
        }
    }, []);

    const value = {
        cartItems,
        cartCount,
        updateCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe ser usado dentro de un CartProvider');
    }
    return context;
};
