import React, { useEffect, useState } from 'react';
import { useFavorites } from '../../context/FavoritesContext';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import './FavoritePage.css';

const FavoritesPage = () => {
    const { toggleFavorite } = useFavorites();
    const navigate = useNavigate();
    const [currentFavorites, setCurrentFavorites] = useState([]);

    // Cargar favoritos desde localStorage al montar el componente
    useEffect(() => {
        const storedFavorites = localStorage.getItem('favorites');
        setCurrentFavorites(storedFavorites ? JSON.parse(storedFavorites) : []);
    }, []);

    // Manejar el clic en un producto para navegar a su página
    const handleProductClick = (producto) => {
        navigate(`/producto/${producto.id}`);
    };

    // Manejar la eliminación de un producto de favoritos
    const handleRemoveFavorite = (e, producto) => {
        e.stopPropagation();
        toggleFavorite(producto); // Actualiza el contexto y localStorage
        setCurrentFavorites((prev) =>
            prev.filter((item) => item.id !== producto.id) // Actualiza visualmente la lista
        );
    };

    return (
        <div className="favorites-page">
            {currentFavorites.length > 0 && <h1>Mis Favoritos</h1>}
            <ul className="favorites-list">
                {currentFavorites.length === 0 ? (
                    <h2>No tienes productos favoritos</h2>
                ) : (
                    currentFavorites.map((producto) => (
                        <li
                            key={producto.id}
                            className="product-item"
                            onClick={() => handleProductClick(producto)}
                        >
                            {producto.image_url && (
                                <img
                                    src={producto.image_url}
                                    alt={producto.nombre}
                                    className="product-image"
                                />
                            )}
                            <div className="product-info">
                                <h3>{producto.nombre}</h3>
                                <p>${producto.precio}</p>
                            </div>
                            <IconButton
                                className="favorite-button"
                                onClick={(e) => handleRemoveFavorite(e, producto)}
                                sx={{
                                    color: 'red',
                                    transition: 'color 0.3s ease',
                                }}
                            >
                                <FavoriteIcon />
                            </IconButton>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default FavoritesPage;
