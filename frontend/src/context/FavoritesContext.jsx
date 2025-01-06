import React, { createContext, useState, useContext, useEffect } from 'react';
import { favoritesService } from '../services/favoritesService';

const FavoritesContext = createContext();

const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user) return;
            
            try {
                const favoritesData = await favoritesService.getFavorites(user.id);
                setFavorites(favoritesData || []);
            } catch (error) {
                console.error('Error al cargar favoritos:', error);
            }
        };

        fetchFavorites();
    }, [user]);

    const toggleFavorite = async (product) => {
        if (!user || !product) return;

        try {
            const isFavorite = favorites.includes(product.id);
            const response = isFavorite 
                ? await favoritesService.removeFavorite(product.id, user.id)
                : await favoritesService.addFavorite(product.id, user.id);
            
            setFavorites(response.favorites);
        } catch (error) {
            console.error('Error al actualizar favoritos:', error);
        }
    };

    const isFavorite = (productId) => favorites.includes(productId);

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites debe usarse dentro de un FavoritesProvider');
    }
    return context;
};

export { FavoritesProvider, useFavorites };