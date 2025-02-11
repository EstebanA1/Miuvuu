import React, { useState, useEffect } from 'react';
import { useFavorites } from '../../context/FavoritesContext';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { getProductos, formatImageUrl } from '../../services/productos'; 
import './FavoritePage.css';

const FavoritesPage = () => {
    const { favorites, toggleFavorite } = useFavorites();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {

                const allProducts = [];
                let page = 1;
                let hasMore = true;

                while (hasMore) {
                    const response = await getProductos(`?page=${page}&limit=100`);
                    const { products: pageProducts, total } = response;
                    
                    allProducts.push(...pageProducts);
                    
                    if (allProducts.length >= total) {
                        hasMore = false;
                    }
                    page++;
                }

                const favoritedProducts = allProducts.filter(product => 
                    favorites.includes(product.id)
                );
                
                setProducts(favoritedProducts);
            } catch (error) {
                console.error('Error al cargar productos:', error);
            } finally {
                setLoading(false);
            }
        };

        if (favorites.length > 0) {
            fetchProducts();
        } else {
            setProducts([]);
            setLoading(false);
        }
    }, [favorites]);

    const handleProductClick = (productId) => {
        navigate(`/producto/${productId}`);
    };

    const handleFavoriteToggle = (e, product) => {
        e.stopPropagation();
        toggleFavorite(product);
    };

    if (loading) {
        return <div className="favorites-page">Cargando favoritos...</div>;
    }

    return (
        <div className="favorites-page">
            {products.length > 0 && <h1>Mis Favoritos</h1>}
            <div className="favorites-list">
                {products.length === 0 ? (
                    <h2>No tienes productos favoritos</h2>
                ) : (
                    products.map((product) => {
                        // Si image_url es un arreglo, extraemos el primero
                        const imageSrc = product.image_url
                            ? Array.isArray(product.image_url)
                                ? formatImageUrl(product.image_url[0])
                                : formatImageUrl(product.image_url)
                            : null;
                        return (
                            <div
                                key={product.id}
                                className="product-item"
                                onClick={() => handleProductClick(product.id)}
                            >
                                {imageSrc && (
                                    <img
                                        src={imageSrc}
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
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;