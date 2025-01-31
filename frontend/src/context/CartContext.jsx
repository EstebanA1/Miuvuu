import React, { createContext, useContext, useState } from 'react';
import { carritoService } from '../services/carritoService';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartCount, setCartCount] = useState(0);

    const updateCart = async (userId) => {
        try {
            const response = await carritoService.getCart(userId);
            const cartItems = response.data.carrito || [];
            const totalItems = cartItems.reduce((total, item) => total + item.cantidad, 0);
            setCartCount(totalItems);
        } catch (error) {
            console.error('Error al actualizar carrito:', error);
        }
    };

    const value = {
        cartCount,
        setCartCount,
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