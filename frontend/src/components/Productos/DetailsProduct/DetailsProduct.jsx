import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumbs, Link, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { getProductoById } from '../../../services/productos';
import { getCategorias } from '../../../services/categorias';
import { useFavorites } from '../../../context/FavoritesContext';
import './DetailsProduct.css';

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
                setMainImage(productData.image_url);
            } catch (error) {
                setError('Error al cargar el producto');
                console.error('Error al obtener los datos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleFavoriteToggle = (e) => {
        e.stopPropagation();
        if (product) {
            toggleFavorite(product);
        }
    };

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true);
                const data = await getProductoById(id);
                setProduct(data);
                setMainImage(data.image_url);
            } catch (error) {
                setError('Error al cargar el producto');
                console.error('Error al obtener los detalles del producto:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [id]);

    if (loading) return <div className="loading-container">Cargando...</div>;
    if (error) return <div className="error-container">{error}</div>;
    if (!product) return <div className="not-found-container">Producto no encontrado</div>;

    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

    const colors = [
        { name: 'Blanco', code: '#FFFFFF', border: true },
        { name: 'Negro', code: '#000000' },
        { name: 'Gris', code: '#808080' }
    ];

    const additionalImages = [
        product.image_url,
    ];

    const getCategoryName = () => {
        const category = categories.find(cat => cat.id === product?.categoria_id);
        return category ? category.nombre : '';
    };

    return (
        <div className="product-detail-container">
            <Breadcrumbs className="breadcrumbs">
                <Link href="/" color="inherit">Inicio</Link>
                <Link href="/categoria" color="inherit">{getCategoryName()}</Link>
                <span>{product.nombre}</span>
            </Breadcrumbs>

            <div className="product-content">
                <div className="product-images">
                    <div className="main-image">
                        <img src={mainImage} alt={product.nombre} />
                    </div>
                    <div className="thumbnail-container">
                        {additionalImages.map((img, index) => (
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

                    <div className="color-selector">
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

                    <div className="size-selector">
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
                        <button className="add-to-cart-btn">
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