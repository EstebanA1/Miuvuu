import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumbs, Link, IconButton } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { getProductoById } from '../../../services/productos';
import { getCategorias } from '../../../services/categorias';
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

    // Simulando tallas disponibles
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

    // Simulando colores disponibles (podrías adaptar esto según tus necesidades)
    const colors = [
        { name: 'Blanco', code: '#FFFFFF', border: true },
        { name: 'Negro', code: '#000000' },
        { name: 'Gris', code: '#808080' }
    ];

    // Simulando imágenes adicionales
    const additionalImages = [
        product.image_url,
        // Aquí podrías agregar más URLs de imágenes si las tienes
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
                {/* Columna izquierda: Imágenes */}
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

                {/* Columna derecha: Información del producto */}
                <div className="product-info">

                    <h1 className="product-title">{product.nombre}</h1>

                    <div className="rating">
                        {/* Aquí podrías agregar el componente de estrellas */}
                        ⭐⭐⭐⭐☆ (4.0)
                    </div>

                    <div className="price">
                        <h2>${product.precio}</h2>
                    </div>

                    {/* Selector de Color */}
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

                    {/* Selector de Talla */}
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

                    {/* Botones de acción */}
                    <div className="action-buttons">
                        <button className="add-to-cart-btn">
                            Añadir al carrito
                        </button>
                        <IconButton className="favorite-btn">
                            <FavoriteBorderIcon />
                        </IconButton>
                    </div>

                    {/* Información de envío */}
                    <div className="shipping-info">
                        <LocalShippingOutlinedIcon />
                        <p>Envío gratis en pedidos superiores a $30.00</p>
                    </div>

                    {/* Descripción del producto */}
                    <div className="product-description">
                        <h3>Descripción</h3>
                        <p>{product.descripcion}</p>
                    </div>

                    {/* Stock */}
                    <div className="stock-info">
                        <p>Stock disponible: {product.cantidad} unidades</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;