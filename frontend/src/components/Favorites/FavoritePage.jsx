import React, { useState, useEffect } from 'react';
import { useFavorites } from '../../context/FavoritesContext';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { getProductos } from '../../services/productos';
import './FavoritePage.css';

const FavoritesPage = () => {
    const { favorites, toggleFavorite } = useFavorites();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productsData = await getProductos();
                const filteredProducts = productsData.filter(product => favorites.includes(product.id));
                setProducts(filteredProducts);
            } catch (error) {
                console.error('Error al cargar productos:', error);
            }
        };

        fetchProducts();
    }, [favorites]);

    const handleProductClick = (productId) => {
        navigate(`/producto/${productId}`);
    };

    const handleFavoriteToggle = (e, product) => {
        e.stopPropagation();
        toggleFavorite(product);
    };

    return (
        <div className="favorites-page">
            {products.length > 0 && <h1>Mis Favoritos</h1>}
            <div className="favorites-list">
                {products.length === 0 ? (
                    <h2>No tienes productos favoritos</h2>
                ) : (
                    products.map((product) => (
                        <div
                            key={product.id}
                            className="product-item"
                            onClick={() => handleProductClick(product.id)}
                        >
                            {product.image_url && (
                                <img 
                                    src={product.image_url} 
                                    alt={product.nombre}
                                    className="product-image"
                                />
                            )}
                            <div className="product-info">
                                <h3>{product.nombre}</h3>
                                <p>${product.precio}</p>
                            </div>
                            {user && (
                                <IconButton
                                    className="favorite-buttonFP"
                                    onClick={(e) => handleFavoriteToggle(e, product)}
                                    sx={{ 
                                        color: favorites.includes(product.id) ? 'red' : 'gray',
                                        '&:hover': {
                                            color: favorites.includes(product.id) ? '#ff3333' : '#666',
                                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                        }
                                    }}
                                >
                                    {favorites.includes(product.id) ? (
                                        <FavoriteIcon />
                                    ) : (
                                        <FavoriteBorderIcon />
                                    )}
                                </IconButton>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;