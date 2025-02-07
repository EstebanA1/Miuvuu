import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumbs, Link, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { formatImageUrls, getProductoById } from '../../../services/productos';
import { getCategorias } from '../../../services/categorias';
import { useFavorites } from '../../../context/FavoritesContext';
import { useCart } from '../../../context/CartContext';
import { carritoService } from '../../../services/carritoService';
import './DetailsProduct.css';
import { Link as RouterLink } from 'react-router-dom';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [mainImage, setMainImage] = useState(null);
    const [categories, setCategories] = useState([]);
    const [user, setUser] = useState(null);
    const { favorites, toggleFavorite } = useFavorites();
    const { updateCart } = useCart();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productData, categoriesData] = await Promise.all([
                    getProductoById(id), 
                    getCategorias()
                ]);

                setProduct(productData);
                setCategories(categoriesData);

                // Para la imagen principal, se toma la primera URL del arreglo
                const formattedImageUrls = formatImageUrls(productData.image_url);
                setMainImage(
                    formattedImageUrls.length > 0 ? formattedImageUrls[0] : null
                );
            } catch (error) {
                setError('Error al cargar el producto');
                console.error('Error al obtener los datos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleAddToCart = async () => {
        if (!selectedSize || !selectedColor) {
            alert('Por favor selecciona talla y color');
            return;
        }

        if (!user) {
            alert('Debes iniciar sesión para agregar productos al carrito');
            return;
        }

        try {
            await carritoService.addToCart(
                product.id,
                user.id,
                selectedColor,
                selectedSize
            );
            updateCart(user.id);
            alert('Producto añadido al carrito');
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            alert('Hubo un error al agregar el producto al carrito. Por favor intenta de nuevo.');
        }
    };

    const handleFavoriteToggle = (e) => {
        e.stopPropagation();
        if (product) {
            toggleFavorite(product);
        }
    };

    if (loading) return <div className="loading-container">Cargando...</div>;
    if (error) return <div className="error-container">{error}</div>;
    if (!product) return <div className="not-found-container">Producto no encontrado</div>;

    // Aquí nos aseguramos de tener un arreglo de URLs
    const imageUrls = formatImageUrls(product.image_url);

    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

    const colors = [
        { name: 'Blanco', code: '#FFFFFF', border: true },
        { name: 'Negro', code: '#000000' },
        { name: 'Gris', code: '#808080' }
    ];

    const getCategory = () => {
        return categories.find(cat => cat.id === product?.categoria_id);
    };

    return (
        <div className="product-detail-container">
            <Breadcrumbs className="breadcrumbs">
                <Link component={RouterLink} to="/" color="inherit">Inicio</Link>
                {getCategory() && (
                    <Link
                        component={RouterLink}
                        to={`/?category=${encodeURIComponent(getCategory().nombre)}&gender=${encodeURIComponent(getCategory().genero)}`}
                        color="inherit"
                    >
                        {getCategory().nombre}
                    </Link>
                )}
                <span>{product.nombre}</span>
            </Breadcrumbs>

            <div className="product-content">
                <div className="product-images">
                    <div className="main-image">
                        {mainImage && <img src={mainImage} alt={product.nombre} />}
                    </div>
                    <div className="thumbnail-container">
                        {imageUrls.map((img, index) => (
                            <div
                                key={index}
                                className={`thumbnail ${mainImage === img ? 'active' : ''}`}
                                onClick={() => setMainImage(img)}
                            >
                                <img src={img} alt={`${product.nombre} vista ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="product-info">
                    <h1 className="product-title">{product.nombre}</h1>

                    <div className="rating">
                        ⭐⭐⭐⭐☆ (4.0)
                    </div>

                    <div className="price">
                        <h2>${product.precio}</h2>
                    </div>

                    <div className="color-selector2">
                        <label>Color</label>
                        <div className="color-options">
                            {colors.map((color) => (
                                <button
                                    key={color.name}
                                    className={`color-option ${selectedColor === color.name ? 'selected' : ''} ${color.border ? 'with-border' : ''}`}
                                    style={{ backgroundColor: color.code }}
                                    onClick={() => setSelectedColor(color.name)}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="size-selector2">
                        <div className="size-header">
                            <label>Talla</label>
                            <button className="size-guide">Guía de tallas</button>
                        </div>
                        <div className="size-options">
                            {sizes.map((size) => (
                                <button
                                    key={size}
                                    className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                                    onClick={() => setSelectedSize(size)}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button className="add-to-cart-btn" onClick={handleAddToCart}>
                            Añadir al carrito
                        </button>
                        {user && (
                            <IconButton
                                className="favorite-btn"
                                onClick={handleFavoriteToggle}
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

                    <div className="shipping-info">
                        <LocalShippingOutlinedIcon />
                        <p>Envío gratis en pedidos superiores a $30.00</p>
                    </div>

                    <div className="product-description">
                        <h3>Descripción</h3>
                        <p>{product.descripcion}</p>
                    </div>

                    <div className="stock-info">
                        <p>Stock disponible: {product.cantidad} unidades</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
