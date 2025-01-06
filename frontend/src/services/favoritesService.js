const BASE_URL = 'http://127.0.0.1:8000/api';

export const favoritesService = {
    getFavorites: async (userId) => {
        try {
            const response = await fetch(`${BASE_URL}/favorites/${userId}`);
            if (!response.ok) {
                throw new Error('Error al obtener favoritos');
            }
            const data = await response.json();
            return data.favorites;
        } catch (error) {
            console.error('Error en getFavorites:', error);
            throw error;
        }
    },

    addFavorite: async (productId, userId) => {
        try {
            const response = await fetch(`${BASE_URL}/favorites/${productId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId }),
            });
            if (!response.ok) {
                throw new Error('Error al agregar favorito');
            }
            return response.json();
        } catch (error) {
            console.error('Error en addFavorite:', error);
            throw error;
        }
    },

    removeFavorite: async (productId, userId) => {
        try {
            const response = await fetch(`${BASE_URL}/favorites/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId }),
            });
            if (!response.ok) {
                throw new Error('Error al eliminar favorito');
            }
            return response.json();
        } catch (error) {
            console.error('Error en removeFavorite:', error);
            throw error;
        }
    }
};