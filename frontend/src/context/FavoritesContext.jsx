import React, { createContext, useState, useContext, useEffect } from 'react';

const FavoritesContext = createContext();

const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState(() => {
        try {
            const storedFavorites = localStorage.getItem('favorites');
            return storedFavorites ? JSON.parse(storedFavorites) : [];
        } catch (error) {
            console.error('Error al cargar favoritos:', error);
            return [];
        }
    });

    // Actualizar localStorage cada vez que cambien los favoritos
    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [favorites]);

    const toggleFavorite = (product) => {
        if (!product) return;
        
        setFavorites(prevFavorites => {
            const isFavorite = prevFavorites.some(item => item.id === product.id);
            
            if (isFavorite) {
                // Remover el producto de favoritos
                const updatedFavorites = prevFavorites.filter(item => item.id !== product.id);
                return updatedFavorites;
            } else {
                // Agregar el producto a favoritos
                return [...prevFavorites, product];
            }
        });
    };

    const isFavorite = (productId) => {
        return favorites.some(item => item.id === productId);
    };

    return (
        <FavoritesContext.Provider value={{ 
            favorites,
            toggleFavorite,
            isFavorite
        }}>
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